import type { SchemaDefinition } from './schema-definition';

/**
 * API response specification
 */
export interface ResponseSpec {
  status: number;
  description?: string;
  schema: SchemaDefinition;
}
