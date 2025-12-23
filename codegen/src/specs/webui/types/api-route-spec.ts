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

export interface APIRouteParam {
  name: string;
  in: 'query' | 'path';
  type: SchemaPrimitive;
  required?: boolean;
}

export interface ResponseSpec {
  status: number;
  description?: string;
  schema: SchemaDefinition;
}

export type SchemaPrimitive = 'string' | 'number' | 'boolean';

export interface SchemaDefinition {
  type: SchemaPrimitive | 'object' | 'array';
  required?: boolean;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
}
