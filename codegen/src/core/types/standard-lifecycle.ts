import type { LifecycleStatus } from './lifecycle-status';

/**
 * IStandardLifecycle - Core contract for all components
 * MANDATORY: All components must implement this interface
 * ≤3 public methods per class (constructors excluded)
 * ≤10 lines per function
 */
export interface IStandardLifecycle {
  // Core lifecycle methods (MANDATORY)
  /**
   * Initialise - Called after construction, register with registry, prepare state
   */
  initialise: () => Promise<void> | void;

  /**
   * Validate - Pre-flight checks before execution, verify dependencies
   */
  validate: () => Promise<void> | void;

  /**
   * Execute - Primary operational method, return values via messaging
   */
  execute: () => Promise<unknown> | unknown;

  /**
   * Cleanup - Resource cleanup and shutdown, idempotent
   */
  cleanup: () => Promise<void> | void;

  // Debug and status methods (MANDATORY)
  /**
   * Debug - Return diagnostic data for debugging
   */
  debug: () => Record<string, unknown>;

  /**
   * Reset - State reset for testing, return to uninitialized
   */
  reset: () => Promise<void> | void;

  /**
   * Status - Return current lifecycle state
   */
  status: () => LifecycleStatus;
}
