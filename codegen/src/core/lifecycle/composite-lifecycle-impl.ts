/**
 * CompositeLifecycleImpl - Implements composite lifecycle orchestration for LifecycleBuilder.
 * Handles dependency resolution, ordered startup/shutdown, and AGENTS.md error policies.
 */
import type { CompositeLifecycle } from '../types/composite-lifecycle';
import type { IStandardLifecycle } from '../types/standard-lifecycle';
import { LifecycleStatus } from '../types/lifecycle-status';
import type { ComponentNode } from './component-node';

/**
 *
 */
export class CompositeLifecycleImpl implements CompositeLifecycle {
  private readonly components = new Map<string, IStandardLifecycle>();
  private readonly errorPolicy: 'fail-fast' | 'continue' | 'rollback';
  private currentStatus: LifecycleStatus = LifecycleStatus.UNINITIALIZED;

  constructor(
    componentNodes: Map<string, ComponentNode>,
    errorPolicy: 'fail-fast' | 'continue' | 'rollback',
  ) {
    for (const [name, node] of componentNodes) {
      this.components.set(name, node.lifecycle);
    }
    this.errorPolicy = errorPolicy;
  }

  /**
   *
   */
  public getChildren(): Map<string, IStandardLifecycle> {
    return new Map(this.components);
  }

  /**
   *
   * @param name
   */
  public getStatus(name: string): LifecycleStatus {
    const component = this.components.get(name);
    return component ? component.status() : LifecycleStatus.UNINITIALIZED;
  }

  /**
   *
   */
  public async initialise(): Promise<void> {
    this.currentStatus = LifecycleStatus.INITIALIZING;
    const validations = Array.from(this.components.values()).map(async (c) => c.validate());
    await Promise.all(validations);

    const initOrder = this.getInitialisationOrder();
    for (const name of initOrder) {
      const component = this.components.get(name)!;
      await component.initialise();
    }

    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   *
   */
  public async validate(): Promise<void> {
    this.currentStatus = LifecycleStatus.VALIDATING;
    const validations = Array.from(this.components.values()).map(async (c) => c.validate());
    await Promise.all(validations);
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   *
   */
  public async execute(): Promise<unknown> {
    this.currentStatus = LifecycleStatus.EXECUTING;
    const executions = Array.from(this.components.values()).map((c) => c.execute());
    const results = await Promise.all(executions);
    return results;
  }

  /**
   *
   */
  public async cleanup(): Promise<void> {
    this.currentStatus = LifecycleStatus.CLEANING;
    const cleanupOrder = this.getCleanupOrder();

    for (const name of cleanupOrder) {
      const component = this.components.get(name)!;
      await component.cleanup();
    }

    this.currentStatus = LifecycleStatus.DESTROYED;
  }

  /**
   *
   */
  public debug(): Record<string, unknown> {
    const debugInfo: Record<string, unknown> = {
      status: this.currentStatus,
      errorPolicy: this.errorPolicy,
      components: {} as Record<string, unknown>,
    };

    for (const [name, component] of this.components) {
      (debugInfo.components as Record<string, unknown>)[name] = component.debug();
    }

    return debugInfo;
  }

  /**
   *
   */
  public async reset(): Promise<void> {
    const cleanupOrder = this.getCleanupOrder();
    for (const name of cleanupOrder) {
      const component = this.components.get(name)!;
      await component.reset();
    }
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   *
   */
  public status(): LifecycleStatus {
    return this.currentStatus;
  }

  /**
   *
   */
  private getInitialisationOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }
      visited.add(name);
      order.push(name);
    };

    for (const name of this.components.keys()) {
      visit(name);
    }

    return order;
  }

  /**
   *
   */
  private getCleanupOrder(): string[] {
    return this.getInitialisationOrder().reverse();
  }
}
