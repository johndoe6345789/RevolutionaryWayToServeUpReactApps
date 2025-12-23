import type { IStandardLifecycle } from './standard-lifecycle';
import type { LifecycleStatus } from './lifecycle-status';

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
