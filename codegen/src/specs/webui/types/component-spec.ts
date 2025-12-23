/**
 * ComponentSpec - Describes a UI component to generate.
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
