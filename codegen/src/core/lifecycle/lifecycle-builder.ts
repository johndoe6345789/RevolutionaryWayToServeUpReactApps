/**
 * LifecycleBuilder - Fluent API for component orchestration (AGENTS.md MANDATORY)
 * Provides declarative component composition with dependency management and error policies
 * ≤3 public methods per class, ≤10 lines per function
 */

import type { CompositeLifecycle } from '../types/composite-lifecycle';
import type { LifecycleBuilder as ILifecycleBuilder } from '../types/lifecycle-builder';
import type { IStandardLifecycle } from '../types/standard-lifecycle';
import type { ComponentNode } from './component-node';
import { LifecycleStatus } from '../types/lifecycle-status';
import { CompositeLifecycleImpl } from './composite-lifecycle-impl';

/**
 * LifecycleBuilder - Implements fluent API for component orchestration
 * MANDATORY: Declarative composition with explicit dependencies and error handling
 */
export class LifecycleBuilder implements ILifecycleBuilder {
  private readonly components = new Map<string, ComponentNode>();
  private errorPolicy: 'fail-fast' | 'continue' | 'rollback' = 'fail-fast';

  /**
   * Add component to the lifecycle (fluent API)
   * @param name
   * @param lifecycle
   * @param startOrder
   * @param stopOrder
   */
  public add(name: string, lifecycle: IStandardLifecycle, startOrder = 0, stopOrder = 0): this {
    this.components.set(name, new ComponentNode(lifecycle, startOrder, stopOrder));
    return this;
  }

  /**
   * Define dependency between components (fluent API)
   * @param name
   * @param dependencyName
   */
  public dependsOn(name: string, dependencyName: string): this {
    const component = this.components.get(name);
    const dependency = this.components.get(dependencyName);

    if (component && dependency) {
      component.dependencies.add(dependencyName);
      dependency.dependents.add(name);
    }
    return this;
  }

  /**
   * Set error handling policy (fluent API)
   * @param policy
   */
  public onError(policy: 'fail-fast' | 'continue' | 'rollback'): this {
    this.errorPolicy = policy;
    return this;
  }

  /**
   * Build the composite lifecycle with orchestration
   */
  public build(): CompositeLifecycle {
    return new CompositeLifecycleImpl(this.components, this.errorPolicy);
  }
}
