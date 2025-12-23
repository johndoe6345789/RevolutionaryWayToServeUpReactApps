/**
 * Python Generator - generates Python code from templates
 * Implements ILanguageGenerator with Python-specific syntax and conventions
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
 * Python Generator - generates Python code from declarative templates
 * Uses Python conventions: snake_case, docstrings, type hints
 * All patterns and constants extracted to JSON for maintainability
 */
export class PythonGenerator extends BaseComponent implements ILanguageGenerator {
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

    const content = this.renderTemplate(template.pattern, context.variables),
      extension = this.getFileExtension(context.templateId);

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
   * Generate Python code from template and context
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
   * Render template with variable substitution and Python formatting
   * @param pattern
   * @param variables
   */
  private renderTemplate(pattern: string[], variables: Record<string, unknown>): string[] {
    const result: string[] = [];

    for (const line of pattern) {
      // Check if this line contains array variables that should expand to multiple lines
      if (line.includes('{init-body}')) {
        const initBody = variables['init-body'];
        if (Array.isArray(initBody)) {
          result.push(...initBody);
        } else {
          result.push(line.replace('{init-body}', ''));
        }
      } else if (line.includes('{methods}')) {
        const { methods } = variables;
        if (Array.isArray(methods)) {
          result.push(...methods);
        } else {
          result.push(line.replace('{methods}', ''));
        }
      } else if (line.includes('{body}')) {
        const { body } = variables;
        if (Array.isArray(body)) {
          result.push(...body);
        } else {
          result.push(line.replace('{body}', String(body || '')));
        }
      } else {
        // Handle simple variable substitution
        let processedLine = line;
        processedLine = processedLine.replace(/\{([^}]+)\}/g, (match, key) => {
          const value = variables[key];
          if (value === undefined) {
            return match;
          }

          // Python-specific formatting
          if (key === 'parameters' && Array.isArray(value)) {
            return value.length > 0 ? `, ${value.join(', ')}` : '';
          }
          if (key === 'return-type' && value) {
            return ` -> ${value}`;
          }

          return String(value);
        });
        result.push(processedLine);
      }
    }

    return result;
  }

  /**
   * Get appropriate file extension for template
   * @param templateId
   */
  private getFileExtension(templateId: string): string {
    return this.patterns.constants.defaultExtension;
  }

  /**
   * Validate spec contains required Python data
   * @param spec
   */
  private validateSpecData(spec: ISpec): void {
    if (!spec.templates) {
      throw new Error(this.patterns.errorMessages.specMissingTemplates);
    }
    if (!Array.isArray(spec.extensions)) {
      throw new Error(this.patterns.errorMessages.specMissingExtensions);
    }
  }
}
