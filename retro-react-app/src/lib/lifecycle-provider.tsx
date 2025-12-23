import React, { createContext, useEffect, useRef, useState } from "react";
import { ComponentLifecycleStatus } from "./lifecycle-status";
import type { IReactComponentLifecycle } from "./react-component-lifecycle";

// Component lifecycle context
export interface LifecycleContextType {
  status: ComponentLifecycleStatus;
  registerComponent: (id: string, lifecycle: IReactComponentLifecycle) => void;
  unregisterComponent: (id: string) => void;
  getComponentStatus: (id: string) => ComponentLifecycleStatus | undefined;
}

export const LifecycleContext = createContext<LifecycleContextType | undefined>(
  undefined,
);

// Lifecycle provider component
export function LifecycleProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const componentsRef = useRef(new Map<string, IReactComponentLifecycle>());
  const [componentsVersion, setComponentsVersion] = useState(0);
  const [globalStatus, setGlobalStatus] = useState<ComponentLifecycleStatus>(
    ComponentLifecycleStatus.UNINITIALIZED,
  );

  const registerComponent = (
    id: string,
    lifecycle: IReactComponentLifecycle,
  ): void => {
    componentsRef.current.set(id, lifecycle);
    setComponentsVersion((previousVersion) => previousVersion + 1);
  };

  const unregisterComponent = (id: string): void => {
    if (componentsRef.current.delete(id)) {
      setComponentsVersion((previousVersion) => previousVersion + 1);
    }
  };

  const getComponentStatus = (
    id: string,
  ): ComponentLifecycleStatus | undefined => {
    const component = componentsRef.current.get(id);
    return component?.status();
  };

  // Initialize all components on mount
  useEffect(() => {
    const initializeComponents = async (): Promise<void> => {
      setGlobalStatus(ComponentLifecycleStatus.INITIALIZING);

      try {
        // Parallel initialization
        const initPromises = Array.from(componentsRef.current.values()).map(
          async (component) => {
            await component.initialise();
          },
        );
        await Promise.all(initPromises);

        // Sequential validation
        setGlobalStatus(ComponentLifecycleStatus.VALIDATING);
        for (const component of componentsRef.current.values()) {
          await component.validate();
        }

        setGlobalStatus(ComponentLifecycleStatus.READY);
      } catch {
        setGlobalStatus(ComponentLifecycleStatus.ERROR);
      }
    };

    if (componentsRef.current.size > 0) {
      void initializeComponents();
    }
  }, [componentsVersion]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      setGlobalStatus(ComponentLifecycleStatus.CLEANING);

      const cleanupPromises = Array.from(componentsRef.current.values()).map(
        async (component) => {
          try {
            await component.cleanup();
          } catch {
            setGlobalStatus(ComponentLifecycleStatus.ERROR);
          }
        },
      );

      void Promise.all(cleanupPromises)
        .then(() => {
          setGlobalStatus(ComponentLifecycleStatus.DESTROYED);
        })
        .catch(() => {
          setGlobalStatus(ComponentLifecycleStatus.ERROR);
        });
    };
  }, [componentsVersion]);

  const contextValue: LifecycleContextType = {
    status: globalStatus,
    registerComponent,
    unregisterComponent,
    getComponentStatus,
  };

  return (
    <LifecycleContext.Provider value={contextValue}>
      {children}
    </LifecycleContext.Provider>
  );
}
