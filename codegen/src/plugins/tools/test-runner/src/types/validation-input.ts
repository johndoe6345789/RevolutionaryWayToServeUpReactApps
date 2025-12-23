/**
 * ValidationInput - Basic input contract for validating plugin operations.
 */
export interface ValidationInput {
  operation: string;
  [key: string]: unknown;
}
