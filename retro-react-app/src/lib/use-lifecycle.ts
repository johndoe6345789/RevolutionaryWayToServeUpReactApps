import { useContext } from 'react';
import { LifecycleContext } from './lifecycle-provider';

// Hook to use lifecycle context
export function useLifecycle() {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error('useLifecycle must be used within a LifecycleProvider');
  }
  return context;
}
