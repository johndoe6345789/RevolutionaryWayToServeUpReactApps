// Standard lifecycle interface for React components
export interface IReactComponentLifecycle {
  initialise(): Promise<void> | void;
  validate(): Promise<void> | void;
  execute(): Promise<unknown> | unknown;
  cleanup(): Promise<void> | void;
  debug(): Record<string, unknown>;
  reset(): Promise<void> | void;
  status(): import('./lifecycle-status').ComponentLifecycleStatus;
}
