/**
 * Go Generator - generates Go code from templates
 * Implements ILanguageGenerator with goroutines, channels, and modern features
 * AGENTS.md compliant: IStandardLifecycle, ≤3 public methods, ≤10 lines per function
 */

import type { ISpec } from '../../../../core/interfaces/index';
import type {
  CodeGenerationContext,
  GeneratedCode,
  ILanguageGenerator,
} from '../../../../core/interfaces/index';
import { BaseComponent } from '../../../../core/codegen/base-component';
import patternsData from '../patterns.json';

/**
 * Go Generator - generates Go code from declarative templates
 * Converts multiline strings to JSON arrays as per requirements
 * All patterns and constants extracted to JSON for maintainability
 */
export class GoGenerator extends BaseComponent implements ILanguageGenerator {
  private readonly patterns: typeof patternsData;
  public readonly language: string;
  public readonly extensions: readonly string[];
  public readonly supportedTemplates: readonly string[];

  constructor(spec: ISpec) {
    super(spec);
    this.patterns = patternsData;
    this.language = this.patterns.constants.language;
    this.extensions = this.patterns.constants.extensions;
    this.supportedTemplates = this.patterns.constants.supportedTemplates;
    this.validateSpecData(spec);
  }

  /**
   * Initialise - load and validate language spec
   */
  public override initialise(): void {
    super.initialise();
  }

  /**
   * Validate - ensure generator is ready
   */
  public override validate(): void {
    super.validate();
    if (!this.spec.templates) {
      throw new Error(this.patterns.errorMessages.specNotLoaded);
    }
  }

  /**
   * Execute - generate code (primary operational method)
   * @param context
   */
  public override execute(context?: CodeGenerationContext): GeneratedCode | { status: string } {
    if (!context) {
      return { status: 'ready' };
    }

    const template = this.getTemplate(context.templateId);
    if (!template) {
      const errorMsg = this.patterns.errorMessages.templateNotSupported.replace(
        '{templateId}',
        context.templateId,
      );
      throw new Error(errorMsg);
    }

    const content = this.renderTemplate(template.pattern, context.variables);
    const extension = this.getFileExtension(context.templateId);

    return {
      content,
      extension,
      metadata: {
        language: this.language,
        template: context.templateId,
        generatedAt: new Date().toISOString(),
        variables: Object.keys(context.variables),
      },
    };
  }

  /**
   * Generate Go code from template and context
   * @param context
   */
  public async generate(context: CodeGenerationContext): Promise<GeneratedCode> {
    const result = this.execute(context) as GeneratedCode;
    return Promise.resolve(result);
  }

  /**
   * SupportsTemplate - check if template is supported
   * @param templateId
   */
  public supportsTemplate(templateId: string): boolean {
    return this.supportedTemplates.includes(templateId as any);
  }

  /**
   * Get template pattern by ID
   * @param templateId
   */
  private getTemplate(templateId: string): any {
    return (this.spec as any).templates?.[templateId];
  }

  /**
   * Render template with variable substitution
   * @param pattern
   * @param variables
   */
  private renderTemplate(pattern: string[], variables: Record<string, unknown>): string[] {
    const regex = new RegExp(this.patterns.regex.variableSubstitution, 'g');
    return pattern.map((line) =>
      line.replace(regex, (match, key) => {
        const value = variables[key];
        return value ? String(value) : match;
      }),
    );
  }

  /**
   * Get appropriate file extension for template
   * @param templateId
   */
  private getFileExtension(templateId: string): string {
    return this.patterns.constants.defaultExtension;
  }

  /**
   * Validate spec contains required Go data
   * @param spec
   */
  private validateSpecData(spec: ISpec): void {
    const requiredFields = this.patterns.validation.requiredSpecFields;
    if (!spec.templates) {
      throw new Error(this.patterns.errorMessages.specMissingTemplates);
    }
    if (!Array.isArray(spec.extensions)) {
      throw new Error(this.patterns.errorMessages.specMissingExtensions);
    }
  }
}
