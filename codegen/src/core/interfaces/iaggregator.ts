/**
 * Aggregator interface - supports unlimited drill-down navigation
 * AGENTS.md compliant: hierarchical component navigation with lifecycle management
 */
import { IComponent } from './icomponent';
import { LifecycleState } from './lifecycle-state';

export interface IAggregator extends IComponent {
  /**
   * Get child component by path segment
   * @param path - Single path segment
   * @returns Child aggregator or component
   */
  getChild(path: string): IAggregator | IComponent | null;

  /**
   * Drill down through multiple path segments (unlimited depth)
   * @param path - Array of path segments
   * @returns Target component or null
   */
  drillDown(path: readonly string[]): IAggregator | IComponent | null;

  /**
   * List child component IDs
   * @returns Array of child IDs
   */
  listChildren(): readonly string[];

  /**
   * Get current lifecycle state
   * @returns Current lifecycle state
   */
  getLifecycleState(): LifecycleState;
}
