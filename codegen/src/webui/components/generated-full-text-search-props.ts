import type { SearchFilters } from './search-filters';

/**
 * GeneratedFullTextSearchProps - Props for the generated full-text search component.
 */
export interface GeneratedFullTextSearchProps {
  onResultSelect?: (resultId: string) => void;
  placeholder?: string;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}
