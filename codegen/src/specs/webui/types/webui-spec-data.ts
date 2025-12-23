import type { APIRouteSpec } from './api-route-spec';
import type { ComponentSpec } from './component-spec';
import type { PageSpec } from './page-spec';

/**
 * WebUISpecData - Parsed specification content for web UI generation.
 */
export interface WebUISpecData {
  components: Record<string, ComponentSpec>;
  pages: Record<string, PageSpec>;
  'api-routes': Record<string, APIRouteSpec>;
  search: {
    title: string;
    summary: string;
  };
}
