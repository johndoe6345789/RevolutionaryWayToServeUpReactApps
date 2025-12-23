import React, { createContext, useEffect, useState } from "react";
import { ComponentLifecycleStatus } from "./lifecycle-status";
import { logLifecycleError } from "./logger";
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
  const [components, setComponents] = useState(
    new Map<string, IReactComponentLifecycle>(),
  );
  const [globalStatus, setGlobalStatus] = useState<ComponentLifecycleStatus>(
    ComponentLifecycleStatus.UNINITIALIZED,
  );

  const registerComponent = (
    id: string,
    lifecycle: IReactComponentLifecycle,
  ): void => {
    setComponents((previousComponents) => {
      const updatedComponents = new Map(previousComponents);
      updatedComponents.set(id, lifecycle);
      return updatedComponents;
    });
  };

  const unregisterComponent = (id: string): void => {
    setComponents((previousComponents) => {
      const updatedComponents = new Map(previousComponents);
      updatedComponents.delete(id);
      return updatedComponents;
    });
  };

  const getComponentStatus = (
    id: string,
  ): ComponentLifecycleStatus | undefined => {
    const component = components.get(id);
    return component?.status();
  };

  // Initialize all components on mount
  useEffect(() => {
    const initializeComponents = async (): Promise<void> => {
      setGlobalStatus(ComponentLifecycleStatus.INITIALIZING);

      try {
        // Parallel initialization
        const initPromises = Array.from(components.values()).map(
          async (component) => {
            await component.initialise();
          },
        );
        await Promise.all(initPromises);

        // Sequential validation
        setGlobalStatus(ComponentLifecycleStatus.VALIDATING);
        for (const component of components.values()) {
          await component.validate();
        }

        setGlobalStatus(ComponentLifecycleStatus.READY);
      } catch (error) {
        logLifecycleError("Failed to initialize lifecycle components", error);
        setGlobalStatus(ComponentLifecycleStatus.ERROR);
      }
    };

    if (components.size > 0) {
      void initializeComponents();
    }
  }, [components]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      setGlobalStatus(ComponentLifecycleStatus.CLEANING);

      const cleanupPromises = Array.from(components.entries()).map(
        async ([componentId, component]) => {
          try {
            await component.cleanup();
          } catch (error) {
            logLifecycleError(
              `Error cleaning up component with id ${componentId}`,
              error,
            );
            setGlobalStatus(ComponentLifecycleStatus.ERROR);
          }
        },
      );

      void Promise.all(cleanupPromises)
        .then(() => {
          setGlobalStatus(ComponentLifecycleStatus.DESTROYED);
        })
        .catch((error) => {
          logLifecycleError("Failed to clean up lifecycle components", error);
          setGlobalStatus(ComponentLifecycleStatus.ERROR);
        });
    };
  }, [components]);

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
