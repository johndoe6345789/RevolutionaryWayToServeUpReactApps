import type { APIRouteSpec } from './api-route-spec';
import type { ComponentSpec } from './component-spec';
import type { PageSpec } from './page-spec';

/**
 * Parsed spec.json representation for Web UI generation
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
