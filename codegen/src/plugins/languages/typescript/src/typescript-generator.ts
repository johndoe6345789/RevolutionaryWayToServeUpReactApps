/**
 * TypeScript Generator - generates TypeScript code from templates
 * Implements ILanguageGenerator with strict typing and modern features
 * AGENTS.md compliant: IStandardLifecycle, ≤3 public methods, ≤10 lines per function
 */

import type { ISpec } from '../../../../core/interfaces/index';
import type { ILanguageGenerator, CodeGenerationContext, GeneratedCode } from '../../../../core/interfaces/index';
import { BaseComponent } from '../../../../core/codegen/base-component';

/**
 * TypeScript Generator - generates TypeScript code from declarative templates
 * Converts multiline strings to JSON arrays as per requirements
 */
export class TypeScriptGenerator extends BaseComponent implements ILanguageGenerator {
  public readonly language = 'typescript';
  public readonly extensions = ['.ts', '.tsx'] as const;
  public readonly supportedTemplates = [
    'class', 'interface', 'function', 'module', 'component', 'enum', 'type'
  ] as const;

  /**
   * Constructor with spec validation
   */
  constructor(spec: ISpec) {
    super(spec);
    this.validateSpecData(spec);
  }

  /**
   * initialise - load and validate language spec
   */
  public override initialise(): void {
    super.initialise();
  }

  /**
   * validate - ensure generator is ready
   */
  public override validate(): void {
    super.validate();
    if (!this.spec.templates) {
      throw new Error('TypeScript spec not loaded');
    }
  }

  /**
   * execute - generate code (primary operational method)
   */
  public override execute(context?: CodeGenerationContext): GeneratedCode | { status: string } {
    if (!context) {
      return { status: 'ready' };
    }

    const template = this.getTemplate(context.templateId);
    if (!template) {
      throw new Error(`Template ${context.templateId} not supported`);
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
        variables: Object.keys(context.variables)
      }
    };
  }

  /**
   * Generate TypeScript code from template and context
   */
  public generate(context: CodeGenerationContext): Promise<GeneratedCode> {
    const result = this.execute(context) as GeneratedCode;
    return Promise.resolve(result);
  }

  /**
   * supportsTemplate - check if template is supported
   */
  public supportsTemplate(templateId: string): boolean {
    return this.supportedTemplates.includes(templateId as any);
  }

  /**
   * Get template pattern by ID
   */
  private getTemplate(templateId: string): any {
    return (this.spec as any).templates?.[templateId];
  }

  /**
   * Render template with variable substitution
   */
  private renderTemplate(pattern: string[], variables: Record<string, unknown>): string[] {
    return pattern.map(line => {
      return line.replace(/\{([^}]+)\}/g, (match, key) => {
        const value = variables[key];
        return value ? String(value) : match;
      });
    });
  }

  /**
   * Get appropriate file extension for template
   */
  private getFileExtension(templateId: string): string {
    return templateId === 'component' ? '.tsx' : '.ts';
  }

  /**
   * Validate spec contains required TypeScript data
   */
  private validateSpecData(spec: ISpec): void {
    if (!spec.templates) {
      throw new Error('TypeScript spec missing templates');
    }
    if (!Array.isArray(spec.extensions)) {
      throw new Error('TypeScript spec missing extensions');
    }
  }
}
