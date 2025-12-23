/**
 * Allowed validation input shape for the test runner plugin
 */
export interface ValidationInput {
  operation: string;
  [key: string]: unknown;
}
