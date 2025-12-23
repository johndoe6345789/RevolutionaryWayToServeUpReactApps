/**
 * Component interface - base contract for all AGENTS.md compliant components
 * Strict lifecycle: initialise → execute → validate, with ≤3 public methods
 */
import type { ISearchMetadata } from './isearch-metadata';
import type { ISpec } from './ispec';

/**
 *
 */
export interface IComponent {
  readonly uuid: string;
  readonly id: string;
  readonly search: ISearchMetadata;
  readonly spec: ISpec;

  /**
   *
   */
  initialise: () => Promise<IComponent>;
  /**
   *
   */
  execute: (context: Record<string, unknown>) => Promise<unknown>;
  /**
   *
   */
  validate: (input: unknown) => boolean;
}
