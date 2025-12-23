/**
 * ComponentNode - Metadata wrapper for lifecycle components used by LifecycleBuilder.
 * Stores dependency and ordering information for orchestration.
 */
import type { IStandardLifecycle } from '../types/standard-lifecycle';

export class ComponentNode {
  public readonly lifecycle: IStandardLifecycle;
  public readonly startOrder: number;
  public readonly stopOrder: number;
  public dependencies = new Set<string>();
  public dependents = new Set<string>();

  constructor(lifecycle: IStandardLifecycle, startOrder = 0, stopOrder = 0) {
    this.lifecycle = lifecycle;
    this.startOrder = startOrder;
    this.stopOrder = stopOrder;
  }
}
