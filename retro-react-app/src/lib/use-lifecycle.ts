import { useContext } from "react";
import { LifecycleContext } from "./lifecycle-provider";
import type { LifecycleContextType } from "./lifecycle-provider";

// Hook to use lifecycle context
export function useLifecycle(): LifecycleContextType {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error("useLifecycle must be used within a LifecycleProvider");
  }
  return context;
}
