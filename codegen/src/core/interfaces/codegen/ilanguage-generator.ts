/**
 * Unified Language Generator Interface - supports any language via declarative JSON
 * AGENTS.md compliant: IStandardLifecycle, language abstraction, declarative specs
 */

import type { IStandardLifecycle } from '../../types/standard-lifecycle';
import type { ISpec } from '../specs/ispec';

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

/**
 * Generated code result - output of code generation
 */
export interface GeneratedCode {
  /** Generated code content as array of lines */
  content: string[];
  /** File extension for the generated code */
  extension: string;
  /** Generation metadata */
  metadata: {
    /** Target language */
    language: string;
    /** Template used */
    template: string;
    /** Generation timestamp */
    generatedAt: string;
    /** Variables used in generation */
    variables: string[];
  };
}

/**
 * Language Generator Interface - unified contract for all language generators
 * Supports any programming language via declarative JSON specifications
 */
export interface ILanguageGenerator extends IStandardLifecycle {
  /** Language identifier (e.g., 'typescript', 'python', 'rust') */
  readonly language: string;

  /** Supported file extensions for this language */
  readonly extensions: readonly string[];

  /** Available template identifiers */
  readonly supportedTemplates: readonly string[];

  /**
   * Generate code for specified template and context
   * @param context - Generation context with template ID and variables
   */
  generate(context: CodeGenerationContext): Promise<GeneratedCode>;

  /**
   * Check if template is supported by this generator
   * @param templateId - Template identifier to check
   */
  supportsTemplate(templateId: string): boolean;

  /**
   * Validate generator state and configuration
   */
  validate(): void;
}
