/**
 * Specification for a generated Web UI component
 */
export interface ComponentSpec {
  id: string;
  search: {
    title: string;
    summary: string;
  };
  features?: string[];
  capabilities?: string[];
  searchFields?: string[];
  filters?: {
    name: string;
    values: string[];
  }[];
}
