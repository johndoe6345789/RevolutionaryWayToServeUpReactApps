/**
 * Specification interface for component definitions
 * AGENTS.md compliant: UUID-identified specs with search metadata and platform support
 */
import { ISearchMetadata } from './isearch-metadata';

export interface ISpec {
  readonly uuid: string;
  readonly id: string;
  readonly type: string;
  readonly search: ISearchMetadata;
  readonly install?: Record<string, Record<string, readonly string[]>>;
  readonly verify?: Record<string, readonly string[]>;
  readonly help?: Record<string, readonly string[]>;
  readonly oneLiners?: ReadonlyArray<{ id: string; description: string; platforms: Record<string, boolean>; command: readonly string[] }>;
  readonly options?: ReadonlyArray<{ flag: string; description: string; platforms: Record<string, boolean> }>;
  readonly dependencies?: readonly string[];
  readonly risks?: { destructive?: boolean; network?: boolean; confirmation?: string };
  readonly [key: string]: unknown;
}
