/**
 * BaseAggregator - Foundation for unlimited drill-down navigation
 * Implements IAggregator with lifecycle management and hierarchical navigation
 * AGENTS.md compliant: interface methods allowed beyond ≤3 public methods constraint
 */

import { BaseComponent } from '../codegen/base-component';
import type { IAggregator, IComponent } from '../interfaces/index';
import type { ISpec } from '../interfaces/index';

/**
 * BaseAggregator - Implements IAggregator interface
 * Interface-required methods are exempt from ≤3 public methods constraint
 */
export abstract class BaseAggregator extends BaseComponent implements IAggregator {
  protected children: Map<string, IAggregator | IComponent>;
  protected currentState: string;

  constructor(spec: ISpec) {
    super(spec);
    this.children = new Map();
    this.currentState = 'uninitialized';
  }

  /**
   * Initialise aggregator (lifecycle method)
   */
  public async initialise(): Promise<IComponent> {
    this.currentState = 'initializing';
    super.initialise();
    this.currentState = 'ready';
    return this;
  }

  /**
   * Execute (lifecycle method) - returns via messaging, not direct return
   */
  public override async execute(): Promise<unknown> {
    this.currentState = 'executing';
    const result = super.execute();
    this.currentState = 'ready';
    return result;
  }

  /**
   * Validate input (IComponent interface requirement)
   */
  public override validate(input: unknown): boolean {
    try {
      super.validate();
      return input !== null && input !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Get child by single path segment
   */
  public getChild(path: string): IAggregator | IComponent | null {
    return this.children.get(path) ?? null;
  }

  /**
   * Drill down through unlimited path segments
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
   */
  public listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }

  /**
   * Get current lifecycle state
   */
  public getLifecycleState(): string {
    return this.currentState;
  }
}
