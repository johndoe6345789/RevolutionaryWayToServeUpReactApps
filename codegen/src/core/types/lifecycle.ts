// Standard Lifecycle Interface
// Defines the contract for all components in the system

export enum LifecycleStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  VALIDATING = 'validating',
  READY = 'ready',
  EXECUTING = 'executing',
  CLEANING = 'cleaning',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

/**
 *
 */
export interface IStandardLifecycle {
  // Core lifecycle methods
  /**
   *
   */
  initialise: () => Promise<void> | void;
  /**
   *
   */
  validate: () => Promise<void> | void;
  /**
   *
   */
  execute: () => Promise<unknown> | unknown;
  /**
   *
   */
  cleanup: () => Promise<void> | void;

  // Debug and status methods
  /**
   *
   */
  debug: () => Record<string, unknown>;
  /**
   *
   */
  reset: () => Promise<void> | void;
  /**
   *
   */
  status: () => LifecycleStatus;

  // Optional extension points (pause/resume/stop can be added via interface extension)
}

/**
 *
 */
export interface LifecycleBuilder {
  /**
   *
   */
  add(name: string, lifecycle: IStandardLifecycle, startOrder?: number, stopOrder?: number): this;
  /**
   *
   */
  dependsOn(name: string, dependencyName: string): this;
  /**
   *
   */
  onError(policy: 'fail-fast' | 'continue' | 'rollback'): this;
  /**
   *
   */
  build: () => CompositeLifecycle;
}

/**
 *
 */
export interface CompositeLifecycle extends IStandardLifecycle {
  /**
   *
   */
  getChildren: () => Map<string, IStandardLifecycle>;
  /**
   *
   */
  getStatus: (name: string) => LifecycleStatus;
}
