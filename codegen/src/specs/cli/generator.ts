/**
 * CLIGenerator - Generates TypeScript CLI from spec
 * Creates command-line interface with drill-down navigation from registry specs
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ISpec } from '../../core/interfaces';
import type { CLIGeneratorSpec } from './types/cli-generator-spec';
import type { CLISpecData } from './types/cli-spec-data';
import type { CommandSpec } from './types/command-spec';
import type { ExecutionResult } from './types/execution-result';
import type { GeneratedFile } from './types/generated-file';

/**
 *
 */
export class CLIGenerator {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: ISpec['search'];
  protected specsPath: string;
  protected outputPath: string;

  constructor(spec: CLIGeneratorSpec) {
    this.uuid = spec.uuid;
    this.id = spec.id;
    this.search = spec.search;
    this.specsPath = spec.specsPath || __dirname;
    this.outputPath = spec.outputPath || path.join(__dirname, '../../../src/cli');
  }

  /**
   *
   */
  public async initialise(): Promise<CLIGenerator> {
    this._ensureDirectories();
    return this;
  }

  /**
   *
   * @param context
   */
  public async execute(context: Record<string, unknown>): Promise<ExecutionResult> {
    const specs = this._loadSpecs();
    const cliCode = this._generateCLI(specs);
    const filePath = path.join(this.outputPath, 'generated-cli.ts');

    fs.writeFileSync(filePath, cliCode);

    const generated: GeneratedFile[] = [
      {
        file: filePath,
        type: 'cli',
        name: 'generated-cli',
      },
    ];

    return { success: true, generated, specs };
  }

  /**
   *
   */
  private _loadSpecs(): CLISpecData {
    const specPath = path.join(this.specsPath, 'spec.json');
    return JSON.parse(fs.readFileSync(specPath, 'utf8')) as CLISpecData;
  }

  /**
   *
   * @param specs
   */
  private _generateCLI(specs: CLISpecData): string {
    const commandHandlers = this._generateCommandHandlers(specs.commands);
    const commandMap = this._generateCommandMap(specs.commands);

    return `/**
 * Generated CLI - ${specs.search.title}
 *
 * ${specs.search.summary}
 *
 * Auto-generated from spec.json
 * TypeScript strict typing with no 'any' types
 */

import { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

export interface CLICommand {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  handler: (args: string[], entrypoint: CodegenEntrypoint) => Promise<void>;
}

export class GeneratedCLI {
  private readonly entrypoint: CodegenEntrypoint;
  private readonly commands: Map<string, CLICommand>;

  constructor(entrypoint: CodegenEntrypoint) {
    this.entrypoint = entrypoint;
    this.commands = new Map(${commandMap});
  }

  /**
   *
   * @param args
   */
  public async run(args: string[]): Promise<void> {
    const commandName = args[0] || 'help',
      commandArgs = args.slice(1);

    const command = this.commands.get(commandName);
    if (!command) {
      this._displayHelp();
      return;
    }

    try {
      await command.handler(commandArgs, this.entrypoint);
    } catch (error) {
      console.error(\`Command failed: \${(error as Error).message}\`);
      process.exit(1);
    }
  }

  /**
   *
   */
  private _displayHelp(): void {
    console.log(\`${specs.search.title}\`);
    console.log('='.repeat(${specs.search.title.length}));
    console.log(\`${specs.search.summary}\`);
    console.log();
    console.log('Commands:');
    for (const [name, command] of this.commands) {
      console.log(\`  \${name.padEnd(12)} \${command.description}\`);
    }
    console.log();
    console.log('Use "command --help" for detailed help on a specific command.');
  }

${commandHandlers}
}

// Export factory function for programmatic use
export function createGeneratedCLI(entrypoint: CodegenEntrypoint): GeneratedCLI {
  return new GeneratedCLI(entrypoint);
}`;
  }

  /**
   *
   * @param commands
   */
  private _generateCommandHandlers(commands: Record<string, CommandSpec>): string {
    const handlers: string[] = [];

    for (const [commandName, commandSpec] of Object.entries(commands)) {
      const handlerName = `_handle${commandName.charAt(0).toUpperCase()}${commandName.slice(1)}`;
      const handler = this._generateCommandHandler(commandName, commandSpec, handlerName);
      handlers.push(handler);
    }

    return handlers.join('\n\n');
  }

  /**
   *
   * @param commandName
   * @param commandSpec
   * @param handlerName
   */
  private _generateCommandHandler(
    commandName: string,
    commandSpec: CommandSpec,
    handlerName: string,
  ): string {
    const asyncHandler = `
  /**
   *
   * @param args
   * @param entrypoint
   */
  private async ${handlerName}(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing ${commandName} command with args:', args);
    // TODO: Implement ${commandName} command logic
  }`;

    return asyncHandler;
  }

  /**
   *
   * @param commands
   */
  private _generateCommandMap(commands: Record<string, CommandSpec>): string {
    const entries = Object.keys(commands)
      .map((name) => {
        const handlerName = `_handle${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        return `['${name}', {
        name: '${name}',
        description: '${commands[name].search.summary}',
        syntax: '${commands[name].syntax || `${name} [options]`}',
        examples: ${JSON.stringify(commands[name].examples || [])},
        handler: this.${handlerName}.bind(this)
      }]`;
      })
      .join(',\n      ');

    return `[\n      ${entries}\n    ]`;
  }

  /**
   *
   */
  private _ensureDirectories(): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
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

module.exports = CLIGenerator;
