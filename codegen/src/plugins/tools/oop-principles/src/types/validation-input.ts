/**
 * ValidationInput - Basic shape for validating plugin inputs.
 */
export interface ValidationInput {
  operation: string;
  [key: string]: unknown;
}
