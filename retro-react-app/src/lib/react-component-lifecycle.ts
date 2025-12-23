import type { ComponentLifecycleStatus } from "./lifecycle-status";

// Standard lifecycle interface for React components
export interface IReactComponentLifecycle {
  initialise(): Promise<void> | void;
  validate(): Promise<void> | void;
  execute(): Promise<void> | void;
  cleanup(): Promise<void> | void;
  debug(): Record<string, unknown>;
  reset(): Promise<void> | void;
  status(): ComponentLifecycleStatus;
}
