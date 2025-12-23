import type { IStandardLifecycle } from './standard-lifecycle';
import type { CompositeLifecycle } from './composite-lifecycle';

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
