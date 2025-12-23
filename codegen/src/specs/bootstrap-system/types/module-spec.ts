/**
 * ModuleSpec - Describes a module to generate.
 */
export interface ModuleSpec {
  search: {
    title: string;
    summary: string;
    capabilities?: string[];
  };
  implementation: {
    methods: string[];
  };
  dependencies?: string[];
}
