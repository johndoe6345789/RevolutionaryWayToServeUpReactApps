import type { SchemaPrimitive } from './api-route-param';

/**
 * Schema definition for request/response bodies
 */
export interface SchemaDefinition {
  type: SchemaPrimitive | 'object' | 'array';
  required?: boolean;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
}
