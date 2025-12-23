/**
 * Generated CLI - Command Line Interface
 *
 * Generated CLI with drill-down navigation and registry-based commands
 *
 * Auto-generated from spec.json
 * TypeScript strict typing with no 'any' types
 */

import type { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

/**
 *
 */
export interface CLICommand {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  handler: (args: string[], entrypoint: CodegenEntrypoint) => Promise<void>;
}

/**
 *
 */
export class GeneratedCLI {
  private readonly entrypoint: CodegenEntrypoint;
  private readonly commands: Map<string, CLICommand>;

  constructor(entrypoint: CodegenEntrypoint) {
    this.entrypoint = entrypoint;
    this.commands = new Map([
      [
        'list',
        {
          name: 'list',
          description: 'List top-level aggregates or drill-down into registries',
          syntax: 'codegen list [category] [subcategory]',
          examples: [
            'codegen list',
            'codegen list tooling',
            'codegen list tooling.package-managers',
          ],
          handler: this._handleList.bind(this),
        },
      ],
      [
        'describe',
        {
          name: 'describe',
          description: 'Show detailed information about components by ID or UUID',
          syntax: 'codegen describe <id_or_uuid>',
          examples: [
            'codegen describe tool.dev.git',
            'codegen describe 550e8400-e29b-41d4-a716-446655440000',
          ],
          handler: this._handleDescribe.bind(this),
        },
      ],
      [
        'search',
        {
          name: 'search',
          description: 'Full-text search across component metadata',
          syntax: 'codegen search "<query>"',
          examples: ['codegen search "version control"', 'codegen search "package manager"'],
          handler: this._handleSearch.bind(this),
        },
      ],
      [
        'tool',
        {
          name: 'tool',
          description: 'Tool installation, verification, and execution operations',
          syntax: 'tool [options]',
          examples: [],
          handler: this._handleTool.bind(this),
        },
      ],
      [
        'runbook',
        {
          name: 'runbook',
          description: 'Generate and export installation/execution runbooks',
          syntax: 'runbook [options]',
          examples: [],
          handler: this._handleRunbook.bind(this),
        },
      ],
      [
        'profile',
        {
          name: 'profile',
          description: 'Profile management and selection',
          syntax: 'profile [options]',
          examples: [],
          handler: this._handleProfile.bind(this),
        },
      ],
      [
        'schema',
        {
          name: 'schema',
          description: 'Generate schema specifications with defaults',
          syntax: 'codegen schema generate <type> --bulk --defaults',
          examples: ['codegen schema generate tool --bulk --defaults'],
          handler: this._handleSchema.bind(this),
        },
      ],
    ]);
  }

  /**
   *
   * @param args
   */
  public async run(args: string[]): Promise<void> {
    const commandName = args[0] || 'help',
      commandArgs = args.slice(1),
      command = this.commands.get(commandName);
    if (!command) {
      this._displayHelp();
      return;
    }

    try {
      await command.handler(commandArgs, this.entrypoint);
    } catch (error) {
      console.error(`Command failed: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  /**
   *
   */
  private _displayHelp(): void {
    console.log(`Command Line Interface`);
    console.log('='.repeat(22));
    console.log(`Generated CLI with drill-down navigation and registry-based commands`);
    console.log();
    console.log('Commands:');
    for (const [name, command] of this.commands) {
      console.log(`  ${name.padEnd(12)} ${command.description}`);
    }
    console.log();
    console.log('Use "command --help" for detailed help on a specific command.');
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleList(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing list command with args:', args);
    // TODO: Implement list command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleDescribe(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing describe command with args:', args);
    // TODO: Implement describe command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleSearch(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing search command with args:', args);
    // TODO: Implement search command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleTool(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing tool command with args:', args);
    // TODO: Implement tool command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleRunbook(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing runbook command with args:', args);
    // TODO: Implement runbook command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleProfile(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing profile command with args:', args);
    // TODO: Implement profile command logic
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleSchema(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    console.log('Executing schema command with args:', args);
    // TODO: Implement schema command logic
  }
}

// Export factory function for programmatic use
export function createGeneratedCLI(entrypoint: CodegenEntrypoint): GeneratedCLI {
  return new GeneratedCLI(entrypoint);
}
