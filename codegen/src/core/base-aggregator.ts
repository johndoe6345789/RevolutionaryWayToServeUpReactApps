/**
 * BaseAggregator - Foundation for unlimited drill-down navigation
 * Implements IAggregator with lifecycle management and hierarchical navigation
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from './base-component';
import { IAggregator, IComponent, LifecycleState } from './interfaces/index';
import { ISpec } from './interfaces/ispec';

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
   */
  public override async initialise(): Promise<IComponent> {
    this.currentState = 'initializing';
    await super.initialise();
    this.currentState = 'ready';
    return this;
  }

  /**
   * Execute with context (lifecycle method)
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    this.currentState = 'executing';
    const result = await super.execute(context);
    this.currentState = 'ready';
    return result;
  }

  /**
   * Shutdown aggregator (lifecycle method)
   */
  public async shutdown(): Promise<void> {
    this.currentState = 'shutdown';
  }

  /**
   * Get child by single path segment
   */
  public getChild(path: string): IAggregator | IComponent | null {
    return this.children.get(path) || null;
  }

  /**
   * Drill down through unlimited path segments
   */
  public drillDown(path: readonly string[]): IAggregator | IComponent | null {
    let current: IAggregator | IComponent | null = this;

    for (const segment of path) {
      if (current && typeof (current as IAggregator).getChild === 'function') {
        current = (current as IAggregator).getChild(segment);
      } else {
        return null;
      }
    }

    return current;
  }

  /**
   * List child component IDs
   */
  public listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }

  /**
   * Get current lifecycle state
   */
  public getLifecycleState(): LifecycleState {
    return this.currentState;
  }
}
