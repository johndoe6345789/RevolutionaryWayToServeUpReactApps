/**
 * Allowed validation input shape for OOP principles plugin
 */
export interface ValidationInput {
  operation: string;
  [key: string]: unknown;
}
