/**
 * Language Generator Interface - unified contract for all language generators
 * Supports any programming language via declarative JSON specifications
 */

import type { IStandardLifecycle } from '../../types/standard-lifecycle';
import type { CodeGenerationContext } from './code-generation-context';
import type { GeneratedCode } from './generated-code';

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
  generate: (context: CodeGenerationContext) => Promise<GeneratedCode>;

  /**
   * Check if template is supported by this generator
   * @param templateId - Template identifier to check
   */
  supportsTemplate: (templateId: string) => boolean;

  /**
   * Validate generator state and configuration
   */
  validate: () => void;
}
