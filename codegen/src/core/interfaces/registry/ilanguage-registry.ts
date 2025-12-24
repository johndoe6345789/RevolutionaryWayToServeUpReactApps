/**
 * Language Registry Interface - manages language generators for any programming language
 * AGENTS.md compliant: registry contract, ≤3 public methods, declarative language support
 */

import type { ILanguageGenerator } from '../codegen/ilanguage-generator';
import type { IRegistry } from './iregistry';

/**
 * Language Registry - registry for all language generators
 * Supports any programming language via plugin system
 */
export interface ILanguageRegistry extends IRegistry {
  /**
   * Get language generator by language identifier
   * @param languageId - Language identifier (e.g., 'typescript', 'python')
   */
  getGenerator: (languageId: string) => ILanguageGenerator | undefined;

  /**
   * Register language generator
   * @param generator - Language generator implementation
   */
  registerGenerator: (generator: ILanguageGenerator) => void;

  /**
   * Get all supported languages
   */
  getSupportedLanguages: () => string[];

  /**
   * Check if language is supported
   * @param languageId - Language identifier to check
   */
  supportsLanguage: (languageId: string) => boolean;
}
