import { useEffect, useState } from 'react';
import { ComponentLifecycleStatus } from './lifecycle-status';
import { IReactComponentLifecycle } from './react-component-lifecycle';
import { useLifecycle } from './use-lifecycle';

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
