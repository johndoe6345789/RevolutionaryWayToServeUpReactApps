import React, { createContext, useContext, useEffect, useState } from 'react';
import { ComponentLifecycleStatus } from './lifecycle-status';
import { IReactComponentLifecycle } from './react-component-lifecycle';

// Component lifecycle context
interface LifecycleContextType {
  status: ComponentLifecycleStatus;
  registerComponent: (id: string, lifecycle: IReactComponentLifecycle) => void;
  unregisterComponent: (id: string) => void;
  getComponentStatus: (id: string) => ComponentLifecycleStatus | undefined;
}

export const LifecycleContext = createContext<LifecycleContextType | undefined>(undefined);

// Lifecycle provider component
export function LifecycleProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [components] = useState(new Map<string, IReactComponentLifecycle>());
  const [globalStatus, setGlobalStatus] = useState<ComponentLifecycleStatus>(ComponentLifecycleStatus.UNINITIALIZED);

  const registerComponent = (id: string, lifecycle: IReactComponentLifecycle): void => {
    components.set(id, lifecycle);
  };

  const unregisterComponent = (id: string): void => {
    components.delete(id);
  };

  const getComponentStatus = (id: string): ComponentLifecycleStatus | undefined => {
    const component = components.get(id);
    return component?.status();
  };

  // Initialize all components on mount
  useEffect(() => {
    const initializeComponents = async (): Promise<void> => {
      setGlobalStatus(ComponentLifecycleStatus.INITIALIZING);

      try {
        // Parallel initialization
        const initPromises = Array.from(components.values()).map(async (component) => {
          await component.initialise();
        });
        await Promise.all(initPromises);

        // Sequential validation
        setGlobalStatus(ComponentLifecycleStatus.VALIDATING);
        for (const component of components.values()) {
          await component.validate();
        }

        setGlobalStatus(ComponentLifecycleStatus.READY);
      } catch (error) {
        setGlobalStatus(ComponentLifecycleStatus.ERROR);
        console.error('Component initialization failed:', error);
      }
    };

    if (components.size > 0) {
      initializeComponents();
    }
  }, [components.size]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setGlobalStatus(ComponentLifecycleStatus.CLEANING);

      const cleanupPromises = Array.from(components.values()).map(async (component) => {
        try {
          await component.cleanup();
        } catch (error) {
          console.error('Component cleanup failed:', error);
        }
      });

      Promise.all(cleanupPromises).then(() => {
        setGlobalStatus(ComponentLifecycleStatus.DESTROYED);
      }).catch((error) => {
        console.error('Cleanup failed:', error);
      });
    };
  }, []);

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
