/**
 * Lifecycle state type - tracks component lifecycle stages
 * AGENTS.md compliant: standard lifecycle states for all components
 */
export type LifecycleState = 'uninitialized' | 'initializing' | 'ready' | 'executing' | 'shutdown';
