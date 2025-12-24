/**
 * IStandardLifecycle - Mandatory contract for all components
 * Defines the standard lifecycle methods that all components must implement
 * Based on docs-viewer core principles
 */

import type { LifecycleStatus } from './lifecycle-status';

/**
 * IStandardLifecycle interface - All components MUST implement this
 * Required methods: initialise, validate, execute, cleanup, debug, reset, status
 */
export interface IStandardLifecycle {
  /**
   * Initialise() - Called after construction, register with dependency registry
   */
  initialise: () => Promise<void> | void;

  /**
   * Validate() - Pre-flight checks before execution, fail fast if possible
   */
  validate: () => Promise<void> | void;

  /**
   * Execute() - Primary operational method, return values via internal messaging service
   */
  execute: () => Promise<unknown> | unknown;

  /**
   * Cleanup() - Resource cleanup and shutdown, should be idempotent
   */
  cleanup: () => Promise<void> | void;

  /**
   * Debug() - Return diagnostic data for troubleshooting
   */
  debug: () => Record<string, unknown>;

  /**
   * Reset() - Reset component to initial state, useful for testing
   */
  reset: () => Promise<void> | void;

  /**
   * Status() - Return current lifecycle status
   */
  status: () => LifecycleStatus;
}
