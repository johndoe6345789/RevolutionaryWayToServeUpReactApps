import type { APIRouteParam } from './api-route-param';
import type { ResponseSpec } from './response-spec';
import type { SchemaDefinition } from './schema-definition';

/**
 * Specification for a generated API route
 */
export interface APIRouteSpec {
  id: string;
  route: string;
  method: string;
  description: string;
  params?: APIRouteParam[];
  body?: {
    schema: SchemaDefinition;
  };
  responses: {
    success: ResponseSpec;
    errors?: ResponseSpec[];
  };
}
