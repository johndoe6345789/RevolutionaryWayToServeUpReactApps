/**
 * BootstrapGenerator - Generates AGENTS.md compliant bootstrap system
 * Reads specs and generates complete module loading and DI system from templates
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseComponent } from '../../core/codegen/base-component';
import type { ExecutionResult } from './types/execution-result';
import type { GeneratedFile } from './types/generated-file';
import type { GeneratorSpec } from './types/generator-spec';
import type { InterfaceSpec } from './types/interface-spec';
import type { ModuleSpec } from './types/module-spec';
import type { SpecsData } from './types/specs-data';

/**
 *
 */
export class BootstrapGenerator extends BaseComponent {
  protected specsPath: string;
  protected outputPath: string;
  protected templates: Record<string, unknown>;

  constructor(spec: GeneratorSpec) {
    super(spec);
    this.specsPath = spec.specsPath || __dirname;
    this.outputPath = spec.outputPath || path.join(__dirname, 'src');
    this.templates = this._loadTemplates();
  }

  /**
   *
   */
  public async initialise(): Promise<BootstrapGenerator> {
    await super.initialise();
    this._ensureDirectories();
    return this;
  }

  /**
   *
   * @param context
   */
  public async execute(context: Record<string, unknown>): Promise<ExecutionResult> {
    if (!this.initialised) {
      await this.initialise();
    }

    const specs = this._loadSpecs(),
      results = this._generateFromSpecs(specs);

    return { success: true, generated: results, specs };
  }

  /**
   *
   */
  private _loadTemplates(): Record<string, unknown> {
    const templatesPath = path.join(__dirname, 'templates.json');
    return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  }

  /**
   *
   */
  private _loadSpecs(): SpecsData {
    const specPath = path.join(this.specsPath, 'spec.json');
    return JSON.parse(fs.readFileSync(specPath, 'utf8')) as SpecsData;
  }

  /**
   *
   * @param specs
   */
  private _generateFromSpecs(specs: SpecsData): GeneratedFile[] {
    const generated: GeneratedFile[] = [];

    // Generate modules and interfaces
    for (const [moduleName, moduleSpec] of Object.entries(specs.modules)) {
      generated.push(this._generateModule(moduleName, moduleSpec));
    }

    for (const [interfaceName, interfaceSpec] of Object.entries(specs.interfaces)) {
      generated.push(this._generateInterface(interfaceName, interfaceSpec));
    }

    // Generate docs and tests
    generated.push(this._generateDocs(specs));
    generated.push(this._generateTests(specs));

    return generated;
  }

  /**
   *
   * @param moduleName
   * @param moduleSpec
   */
  private _generateModule(moduleName: string, moduleSpec: ModuleSpec): GeneratedFile {
    const className = this._toClassName(moduleName),
      filePath = path.join(this.outputPath, `${moduleName}.js`),
      code = this._generateModuleCode(className, moduleSpec);

    fs.writeFileSync(filePath, code);
    return { file: filePath, type: 'module', name: moduleName };
  }

  /**
   *
   * @param interfaceName
   * @param interfaceSpec
   */
  private _generateInterface(interfaceName: string, interfaceSpec: InterfaceSpec): GeneratedFile {
    const fileName = `${interfaceName.toLowerCase()}.js`,
      filePath = path.join(this.outputPath, 'interfaces', fileName),
      code = this._generateInterfaceCode(interfaceName, interfaceSpec);

    fs.writeFileSync(filePath, code);
    return { file: filePath, type: 'interface', name: interfaceName };
  }

  /**
   *
   * @param specs
   */
  private _generateDocs(specs: SpecsData): GeneratedFile {
    const docsPath = path.join(__dirname, 'docs', 'README.md'),
      content = this._generateDocsContent(specs);

    fs.writeFileSync(docsPath, content);
    return { file: docsPath, type: 'documentation', name: 'README' };
  }

  /**
   *
   * @param specs
   */
  private _generateTests(specs: SpecsData): GeneratedFile {
    const testsPath = path.join(__dirname, 'tests', 'bootstrap-system.test.js'),
      content = this._generateTestsContent(specs);

    fs.writeFileSync(testsPath, content);
    return { file: testsPath, type: 'test', name: 'bootstrap-system' };
  }

  /**
   *
   * @param className
   * @param moduleSpec
   */
  private _generateModuleCode(className: string, moduleSpec: ModuleSpec): string {
    const methods = moduleSpec.implementation.methods
      .map((method) => this._getMethodTemplate(method).join('\n'))
      .join('\n\n');

    return `/**
 * ${className} - AGENTS.md compliant ${moduleSpec.search.title}
 *
 * ${moduleSpec.search.summary}
 *
 * This module provides ${moduleSpec.search.capabilities?.join(', ') || 'core functionality'}
 * as part of the bootstrap system.
 *
 * @class ${className}
 * @extends BaseComponent
 */
const BaseComponent = require('../../../core/codegen/base-component');

class ${className} extends BaseComponent {
  constructor(spec) {
    super(spec);
    this._dependencies = spec.dependencies || {};
    this._initialized = false;
  }

  async initialise() {
    await super.initialise();
    if (!this._validateDependencies()) {
      throw new Error(\`Missing required dependencies for \${this.spec.id}\`);
    }
    this._initialized = true;
    return this;
  }

  async execute(context) {
    if (!this._initialized) {
      throw new Error('${className} must be initialized before execution');
    }
    try {
      const result = await this._executeCore(context);
      return { success: true, result, timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async _executeCore(context) {
    return { message: '${className} executed successfully' };
  }

  validate(input) {
    return input && typeof input === 'object' && input.id && typeof input.id === 'string';
  }

  _validateDependencies() {
    const requiredDeps = ${JSON.stringify(moduleSpec.dependencies || [])};
    return requiredDeps.every(dep => this._dependencies[dep]);
  }
${methods}
}

module.exports = ${className};`;
  }

  /**
   *
   * @param interfaceName
   * @param interfaceSpec
   */
  private _generateInterfaceCode(interfaceName: string, interfaceSpec: InterfaceSpec): string {
    const methods = interfaceSpec.methods.map((method) => `  ${method}() {}`).join('\n');
    return `/**
 * ${interfaceName} - AGENTS.md interface definition
 * Auto-generated from spec.json
 */

class ${interfaceName} {
${methods}
}

module.exports = ${interfaceName};`;
  }

  /**
   *
   * @param specs
   */
  private _generateDocsContent(specs: SpecsData): string {
    const templates = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'docs-templates.json'), 'utf8'),
      ),
      template = templates.README,
      // Basic substitutions
      content = template
        .map((line: string) =>
          line
            .replace('{title}', specs.search.title)
            .replace('{description}', specs.search.summary)
            .replace('{systemName}', specs.search.title)
            .replace(
              '{capabilities}',
              specs.search.capabilities?.join(', ') || 'core functionality',
            )
            .replace('{moduleCount}', Object.keys(specs.modules).length)
            .replace(
              '{moduleList}',
              Object.keys(specs.modules)
                .map((name: string) => `1. ${name.replace('-', ' ')}`)
                .join('\n'),
            )
            .replace('{moduleDetails}', this._generateModuleDetails(specs))
            .replace('{usageExamples}', this._generateUsageExamples(specs))
            .replace('{integrationExample}', this._generateIntegrationExample())
            .replace('{errorHandling}', this._generateErrorHandling())
            .replace('{testing}', this._generateTesting())
            .replace('{development}', this._generateDevelopment())
            .replace('{performance}', this._generatePerformance())
            .replace('{security}', this._generateSecurity())
            .replace('{contributing}', this._generateContributing())
            .replace('{license}', this._generateLicense()),
        )
        .join('\n');

    return content;
  }

  /**
   *
   * @param specs
   */
  private _generateTestsContent(specs: SpecsData): string {
    const templates = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'test-templates.json'), 'utf8'),
      ),
      content: string[] = [];

    // Generate individual module tests
    for (const [moduleName, moduleSpec] of Object.entries(specs.modules)) {
      const className = this._toClassName(moduleName),
        testSuite = (templates.testSuite as string[])
          .map((line: string) =>
            line
              .replace(/{moduleName}/g, moduleSpec.search.title)
              .replace(/{className}/g, className)
              .replace(/{fileName}/g, moduleName)
              .replace('{specFields}', this._generateSpecFields(moduleSpec))
              .replace('{methodTests}', this._generateMethodTests(moduleSpec)),
          )
          .join('\n');
      content.push(testSuite);
    }

    // Add integration tests
    content.push((templates.integrationTests as string[]).join('\n'));

    return content.join('\n\n');
  }

  /**
   *
   * @param methodName
   */
  private _getMethodTemplate(methodName: string): string[] {
    return (
      (this.templates.methods as Record<string, string[]>)[methodName] ||
      (this.templates.defaultMethod as string[]).map((line: string) =>
        line.replace(/{methodName}/g, methodName),
      )
    );
  }

  /**
   *
   * @param moduleName
   */
  private _toClassName(moduleName: string): string {
    return moduleName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   *
   */
  private _ensureDirectories(): void {
    const dirs = [
      this.outputPath,
      path.join(this.outputPath, 'interfaces'),
      path.join(__dirname, 'docs'),
      path.join(__dirname, 'tests'),
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Placeholder implementations for documentation generation
  /**
   *
   * @param specs
   */
  private _generateModuleDetails(specs: SpecsData): string {
    return 'Module details would be generated here';
  }
  /**
   *
   * @param specs
   */
  private _generateUsageExamples(specs: SpecsData): string {
    return 'Usage examples would be generated here';
  }
  /**
   *
   */
  private _generateIntegrationExample(): string {
    return 'Integration example would be generated here';
  }
  /**
   *
   */
  private _generateErrorHandling(): string {
    return 'Error handling documentation would be generated here';
  }
  /**
   *
   */
  private _generateTesting(): string {
    return 'Testing documentation would be generated here';
  }
  /**
   *
   */
  private _generateDevelopment(): string {
    return 'Development documentation would be generated here';
  }
  /**
   *
   */
  private _generatePerformance(): string {
    return 'Performance documentation would be generated here';
  }
  /**
   *
   */
  private _generateSecurity(): string {
    return 'Security documentation would be generated here';
  }
  /**
   *
   */
  private _generateContributing(): string {
    return 'Contributing documentation would be generated here';
  }
  /**
   *
   */
  private _generateLicense(): string {
    return 'License information would be generated here';
  }
  /**
   *
   * @param moduleSpec
   */
  private _generateSpecFields(moduleSpec: ModuleSpec): string {
    return '';
  }
  /**
   *
   * @param moduleSpec
   */
  private _generateMethodTests(moduleSpec: ModuleSpec): string {
    return '';
  }

  /**
   *
   * @param input
   */
  public validate(input: unknown): boolean {
    return (
      input !== null &&
      input !== undefined &&
      typeof input === 'object' &&
      'specsPath' in input &&
      'outputPath' in input
    );
  }
}

module.exports = BootstrapGenerator;
