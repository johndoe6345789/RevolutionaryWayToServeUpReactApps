/**
 * ComponentSpec - Describes a UI component to generate.
 */
export interface ComponentSpec {
  id: string;
  search: {
    title: string;
    summary: string;
  };
  inputs?: ComponentInputSpec[];
  actions?: ComponentActionSpec[];
  features?: string[];
  capabilities?: string[];
  searchFields?: string[];
  filters?: {
    name: string;
    values: string[];
  }[];
}

export interface ComponentInputSpec {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'textarea';
  placeholder?: string;
  defaultValue?: string;
  helperText?: string;
  options?: string[];
}

export interface ComponentActionSpec {
  name: string;
  label: string;
  helperText?: string;
}
