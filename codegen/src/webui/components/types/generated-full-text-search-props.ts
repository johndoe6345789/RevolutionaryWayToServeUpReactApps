import type { SearchFilters } from './search-filters';

/**
 * Props for the generated full-text search component
 */
export interface GeneratedFullTextSearchProps {
  onResultSelect?: (resultId: string) => void;
  placeholder?: string;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}
