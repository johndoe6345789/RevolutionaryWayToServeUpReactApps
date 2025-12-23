/**
 * React Component Lifecycle Manager - applies AGENTS.md lifecycle patterns to React
 * Manages component initialization, execution, and cleanup with builder pattern
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Lifecycle status enum (matches AGENTS.md)
export enum ComponentLifecycleStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  VALIDATING = 'validating',
  READY = 'ready',
  EXECUTING = 'executing',
  CLEANING = 'cleaning',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

// Standard lifecycle interface for React components
export interface IReactComponentLifecycle {
  initialise(): Promise<void> | void;
  validate(): Promise<void> | void;
  execute(): Promise<unknown> | unknown;
  cleanup(): Promise<void> | void;
  debug(): Record<string, unknown>;
  reset(): Promise<void> | void;
  status(): ComponentLifecycleStatus;
}

// Component lifecycle context
interface LifecycleContextType {
  status: ComponentLifecycleStatus;
  registerComponent: (id: string, lifecycle: IReactComponentLifecycle) => void;
  unregisterComponent: (id: string) => void;
  getComponentStatus: (id: string) => ComponentLifecycleStatus | undefined;
}

const LifecycleContext = createContext<LifecycleContextType | undefined>(undefined);

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

// Hook to use lifecycle context
export function useLifecycle(): LifecycleContextType {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error('useLifecycle must be used within a LifecycleProvider');
  }
  return context;
}

// Component lifecycle hook
export function useComponentLifecycle(
  id: string,
  lifecycleImpl: IReactComponentLifecycle
): ComponentLifecycleStatus {
  const { registerComponent, unregisterComponent, getComponentStatus } = useLifecycle();
  const [status, setStatus] = useState<ComponentLifecycleStatus>(ComponentLifecycleStatus.UNINITIALIZED);

  useEffect(() => {
    registerComponent(id, lifecycleImpl);

    // Update status periodically
    const interval = setInterval(() => {
      const currentStatus = getComponentStatus(id);
      if (currentStatus) {
        setStatus(currentStatus);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      unregisterComponent(id);
    };
  }, [id, lifecycleImpl, registerComponent, unregisterComponent, getComponentStatus]);

  return status;
}
