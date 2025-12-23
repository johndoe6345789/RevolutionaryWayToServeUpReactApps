/**
 * Lifecycle module - AGENTS.md compliant component orchestration
 * Exports the LifecycleBuilder for declarative component composition
 */

export { LifecycleBuilder } from './lifecycle-builder';
export type { IStandardLifecycle } from '../types/standard-lifecycle';
export type { LifecycleBuilder as ILifecycleBuilder } from '../types/lifecycle-builder';
export type { CompositeLifecycle } from '../types/composite-lifecycle';
export { LifecycleStatus } from '../types/lifecycle-status';
