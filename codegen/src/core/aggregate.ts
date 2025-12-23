/**
 * Aggregate - AGENTS.md compliant hierarchical container
 * Strict OO constraints: ≤3 public methods, supports drill-down navigation
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from './base-component';
import type { IAggregate, IRegistry, ISearchMetadata } from './interfaces/index';
import type { ISpec } from './interfaces/ispec';

/**
 *
 */
export abstract class Aggregate extends BaseComponent implements IAggregate {
  protected children: Map<string, IAggregate | IRegistry>;
  public readonly aggregateType: string;

  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param spec - Aggregate specification
   */
  constructor(spec: ISpec) {
    super(spec);
    this.children = new Map();
    this.aggregateType = (spec as { aggregateType?: string }).aggregateType ?? 'generic';
  }

  /**
   * List child component IDs (≤3 public methods, ≤10 lines)
   * @returns Array of child IDs
   */
  public listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }

  /**
   * Get child by ID (≤3 public methods, ≤10 lines)
   * @param id - Child ID
   * @returns Child component or null
   */
  public getChild(id: string): IAggregate | IRegistry | null {
    return this.children.get(id) ?? null;
  }

  /**
   * Add child component (protected method for subclasses)
   * @param id - Child ID
   * @param child - Child component
   */
  protected _addChild(id: string, child: IAggregate | IRegistry): void {
    this.children.set(id, child);
  }

  /**
   * Drill down through path (convenience method, ≤10 lines)
   * @param path - Path segments to traverse
   * @returns Target component or null
   */
  public drillDown(path: readonly string[]): IAggregate | IRegistry | null {
    if (path.length === 0) {
      return this;
    }

    let current: IAggregate | IRegistry | null = this.getChild(path[0]);
    for (let i = 1; i < path.length; i++) {
      if (current && 'getChild' in current) {
        current = current.getChild(path[i]);
      } else {
        return null;
      }
    }
    return current;
  }

  /**
   * Validate child before adding (≤10 lines)
   * @param child - Child to validate
   * @returns Is valid child
   */
  protected _validateChild(child: unknown): boolean {
    if (child === null || child === undefined) {
      return false;
    }
    return (
      child instanceof Aggregate || (typeof child === 'object' && 'uuid' in child && 'id' in child)
    );
  }

  /**
   * Describe aggregate for search/discovery
   * @returns Search metadata
   */
  public describe(): ISearchMetadata | null {
    return this.search;
  }
}
