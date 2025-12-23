/**
 * Code generation context - variables and metadata for template rendering
 */
export interface CodeGenerationContext {
  /** Template identifier */
  templateId: string;
  /** Variable substitutions for template rendering */
  variables: Record<string, unknown>;
  /** Optional generation metadata */
  metadata?: Record<string, unknown>;
}
