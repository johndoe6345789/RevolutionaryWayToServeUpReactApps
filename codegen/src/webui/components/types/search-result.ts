/**
 * Represents a search result displayed in the generated UI
 */
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  domain: string;
  type: string;
  score: number;
  highlights: string[];
}
