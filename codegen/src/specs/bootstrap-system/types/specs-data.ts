import type { InterfaceSpec } from './interface-spec';
import type { ModuleSpec } from './module-spec';

/**
 * SpecsData - Parsed specification content for generation.
 */
export interface SpecsData {
  modules: Record<string, ModuleSpec>;
  interfaces: Record<string, InterfaceSpec>;
  search: {
    title: string;
    summary: string;
    capabilities?: string[];
  };
}
