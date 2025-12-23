/**
 * API route parameter definition
 */
export interface APIRouteParam {
  name: string;
  in: 'query' | 'path';
  type: SchemaPrimitive;
  required?: boolean;
}

export type SchemaPrimitive = 'string' | 'number' | 'boolean';
