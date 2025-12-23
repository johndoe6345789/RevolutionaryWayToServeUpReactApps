/**
 * Registry interface - immutable index for component discovery
 * AGENTS.md compliant: ≤3 public methods, queryable by ID and UUID
 */
import { IComponent } from './icomponent';
import { ISearchMetadata } from './isearch-metadata';

export interface IRegistry {
  readonly listIds: () => readonly string[];
  readonly get: (idOrUuid: string) => IComponent | null;
  readonly describe: (idOrUuid: string) => ISearchMetadata | null;
}
