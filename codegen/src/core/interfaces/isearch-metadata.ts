/**
 * Search metadata interface for discoverability and filtering
 * Part of AGENTS.md compliance: structured search metadata with keywords, tags, aliases
 */
export interface ISearchMetadata {
  readonly title: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly domain: string;
  readonly capabilities: readonly string[];
}
