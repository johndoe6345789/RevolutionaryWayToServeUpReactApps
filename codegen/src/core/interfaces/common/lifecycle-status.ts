/**
 * LifecycleStatus - Enumeration of component lifecycle states
 * Defines the standard states that all components transition through
 */

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
