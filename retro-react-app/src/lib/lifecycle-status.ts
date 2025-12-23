// Lifecycle status enum (matches AGENTS.md)
export enum ComponentLifecycleStatus {
  UNINITIALIZED = "uninitialized",
  INITIALIZING = "initializing",
  VALIDATING = "validating",
  READY = "ready",
  EXECUTING = "executing",
  CLEANING = "cleaning",
  ERROR = "error",
  DESTROYED = "destroyed",
}
