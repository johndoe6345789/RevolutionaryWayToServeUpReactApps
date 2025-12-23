/**
 * Lifecycle manager interface - manages component lifecycle transitions
 * AGENTS.md compliant: validates and tracks lifecycle state changes
 */
import type { IComponent } from './icomponent';
import type { LifecycleState } from './lifecycle-state';

/**
 *
 */
export interface ILifecycleManager {
  /**
   *
   */
  getState: (component: IComponent) => LifecycleState;
  /**
   *
   */
  canTransition: (component: IComponent, newState: LifecycleState) => boolean;
  /**
   *
   */
  transition: (component: IComponent, newState: LifecycleState) => void;
}
