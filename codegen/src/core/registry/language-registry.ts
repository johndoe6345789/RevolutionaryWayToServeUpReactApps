/**
 * Language Registry Implementation - manages any programming language generators
 * AGENTS.md compliant: IStandardLifecycle, registry contract, ≤3 public methods, language abstraction
 */

import type { ILanguageGenerator } from '../interfaces/codegen/ilanguage-generator';
import type { ILanguageRegistry } from '../interfaces/registry/ilanguage-registry';
import type { IStandardLifecycle } from '../types/standard-lifecycle';
import { BaseComponent } from '../codegen/base-component';

/**
 * Language Registry - manages language generators for any programming language
 * Supports declarative language specifications and plugin-based extensibility
 */
export class LanguageRegistry extends BaseComponent implements ILanguageRegistry {
  private readonly generators = new Map<string, ILanguageGenerator>();

  /**
   * Get language generator by language identifier
   * @param languageId - Language identifier (e.g., 'typescript', 'python')
   */
  public getGenerator(languageId: string): ILanguageGenerator | undefined {
    return this.generators.get(languageId);
  }

  /**
   * Register language generator
   * @param generator - Language generator implementation
   */
  public registerGenerator(generator: ILanguageGenerator): void {
    this.generators.set(generator.language, generator);
  }

  /**
   * Get all supported languages
   */
  public getSupportedLanguages(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Check if language is supported
   * @param languageId - Language identifier to check
   */
  public supportsLanguage(languageId: string): boolean {
    return this.generators.has(languageId);
  }

  /**
   * Registry contract: get by ID or UUID
   * @param idOrUuid - Component identifier or UUID
   */
  public get(idOrUuid: string): IStandardLifecycle | undefined {
    return this.generators.get(idOrUuid);
  }

  /**
   * Registry contract: list all IDs
   */
  public listIds(): string[] {
    return this.getSupportedLanguages();
  }

  /**
   * Registry contract: describe component
   * @param idOrUuid - Component identifier or UUID
   */
  public describe(idOrUuid: string): Record<string, unknown> | undefined {
    const generator = this.generators.get(idOrUuid);
    if (!generator) {
      return undefined;
    }

    return {
      id: generator.language,
      type: 'language-generator',
      extensions: generator.extensions,
      supportedTemplates: generator.supportedTemplates,
      status: generator.status(),
    };
  }
}
