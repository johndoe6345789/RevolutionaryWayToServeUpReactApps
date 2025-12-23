/**
 * BaseAggregator - Foundation for unlimited drill-down navigation
 * Implements IAggregator with lifecycle management and hierarchical navigation
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from './base-component';
import type { IAggregator, IComponent, LifecycleState } from './interfaces/index';
import type { ISpec } from './interfaces/ispec';

/**
 *
 */
export abstract class BaseAggregator extends BaseComponent implements IAggregator {
  protected children: Map<string, IAggregator | IComponent>;
  protected currentState: LifecycleState;

  constructor(spec: ISpec) {
    super(spec);
    this.children = new Map();
    this.currentState = 'uninitialized';
  }

  /**
   * Initialize aggregator (lifecycle method)
   * @returns Promise resolving to initialized component
   */
  public override async initialise(): Promise<IComponent> {
    this.currentState = 'initializing';
    await super.initialise();
    this.currentState = 'ready';
    return this;
  }

  /**
   * Execute with context (lifecycle method)
   * @param context - Execution context
   * @returns Promise resolving to execution result
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    this.currentState = 'executing';
    const result = await super.execute(context);
    this.currentState = 'ready';
    return result;
  }

  /**
   * Shutdown aggregator (lifecycle method)
   * @returns Promise resolving when shutdown is complete
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async shutdown(): Promise<void> {
    this.currentState = 'shutdown';
  }

  /**
   * Get child by single path segment
   * @param path - Path segment to find
   * @returns Child component or null if not found
   */
  public getChild(path: string): IAggregator | IComponent | null {
    return this.children.get(path) ?? null;
  }

  /**
   * Drill down through unlimited path segments
   * @param path - Array of path segments
   * @returns Target component or null if path doesn't exist
   */
  public drillDown(path: readonly string[]): IAggregator | IComponent | null {
    return path.reduce<IAggregator | IComponent | null>((current, segment) => {
      if (current && typeof (current as IAggregator).getChild === 'function') {
        return (current as IAggregator).getChild(segment);
      }
      return null;
    }, this);
  }

  /**
   * List child component IDs
   * @returns Array of child component IDs
   */
  public listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }

  /**
   * Get current lifecycle state
   * @returns Current lifecycle state
   */
  public getLifecycleState(): LifecycleState {
    return this.currentState;
  }
}
