/**
 * Module specification used to generate bootstrap modules
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
