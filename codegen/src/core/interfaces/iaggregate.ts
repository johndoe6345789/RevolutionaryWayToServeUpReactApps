/**
 * Aggregate interface - hierarchical container for registries and sub-aggregates
 * AGENTS.md compliant: drill-down navigation with ≤3 public methods
 */
import type { IRegistry } from './iregistry';
import type { ISearchMetadata } from './isearch-metadata';

/**
 *
 */
export interface IAggregate {
  readonly listChildren: () => readonly string[];
  readonly getChild: (idOrUuid: string) => IAggregate | IRegistry | null;
  readonly describe: () => ISearchMetadata | null;
}
