/**
 * Minimal search metadata interface for validation purposes
 * Simplified version used by SpecValidator
 */

/**
 *
 */
export interface ISearchMetadataForValidation {
  title: string;
  summary: string;
  keywords: string[];
  [key: string]: unknown;
}
