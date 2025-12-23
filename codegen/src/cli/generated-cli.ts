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
   * Handle list command - drill-down navigation through aggregates
   * @param args
   * @param entrypoint
   */
  private async _handleList(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const path = args.filter(arg => !arg.startsWith('-'));

    if (path.length === 0) {
      // List top-level aggregates
      console.log('Available aggregates:');
      const aggregator = entrypoint.getAggregator();
      const children = aggregator.listChildren();
      for (const childId of children) {
        const child = aggregator.getChild(childId);
        if (child) {
          const title = child.search?.title || 'No title';
          console.log(`  ${childId} - ${title}`);
        } else {
          console.log(`  ${childId}`);
        }
      }
      return;
    }

    // Drill down into specific path
    const targetAggregator = entrypoint.drillDown(path);
    if (!targetAggregator) {
      console.error(`Aggregate path '${path.join('.')}' not found`);
      process.exit(1);
    }

    const children = targetAggregator.listChildren();
    if (children.length === 0) {
      console.log(`No children found in ${path.join('.')}`);
      return;
    }

    console.log(`Contents of ${path.join('.')}:`);
    for (const childId of children) {
      const child = targetAggregator.getChild(childId);
      if (child) {
        const title = child.search?.title || 'No title';
        const summary = child.search?.summary ? ` - ${child.search.summary}` : '';
        console.log(`  ${childId}${summary}`);
      } else {
        console.log(`  ${childId}`);
      }
    }
  }

  /**
   * Handle describe command - show detailed component information
   * @param args
   * @param entrypoint
   */
  private async _handleDescribe(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const targetId = args[0];
    if (!targetId) {
      console.error('Usage: codegen describe <id_or_uuid>');
      process.exit(1);
    }

    // Try to find component by drilling down through aggregates
    const aggregator = entrypoint.getAggregator();
    const topLevelIds = aggregator.listChildren();

    for (const aggId of topLevelIds) {
      const aggregate = aggregator.getChild(aggId);
      if (aggregate && 'drillDown' in aggregate) {
        // Try direct child first
        let component = aggregate.getChild(targetId);
        if (component) {
          this._displayComponentDetails(component, targetId);
          return;
        }

        // Try recursive search in this aggregate
        component = this._findComponentRecursive(aggregate, targetId);
        if (component) {
          this._displayComponentDetails(component, targetId);
          return;
        }
      }
    }

    console.error(`Component '${targetId}' not found`);
    process.exit(1);
  }

  /**
   * Recursively search for component in aggregate tree
   * @param aggregator
   * @param targetId
   */
  private _findComponentRecursive(aggregator: any, targetId: string): any {
    const children = aggregator.listChildren();
    for (const childId of children) {
      const child = aggregator.getChild(childId);
      if (child) {
        if (child.id === targetId || child.uuid === targetId) {
          return child;
        }
        if ('drillDown' in child) {
          const found = this._findComponentRecursive(child, targetId);
          if (found) return found;
        }
      }
    }
    return null;
  }

  /**
   * Display detailed component information
   * @param component
   * @param requestedId
   */
  private _displayComponentDetails(component: any, requestedId: string): void {
    console.log(`Component: ${component.id}`);
    console.log(`UUID: ${component.uuid}`);
    console.log(`Type: ${component.type}`);

    if (component.search) {
      console.log(`Title: ${component.search.title}`);
      console.log(`Summary: ${component.search.summary}`);
      if (component.search.keywords) {
        console.log(`Keywords: ${component.search.keywords.join(', ')}`);
      }
      if (component.search.tags) {
        console.log(`Tags: ${component.search.tags.join(', ')}`);
      }
      console.log(`Domain: ${component.search.domain}`);
      if (component.search.capabilities) {
        console.log(`Capabilities: ${component.search.capabilities.join(', ')}`);
      }
    }

    if (component.status) {
      console.log(`Status: ${component.status()}`);
    }

    // Display additional metadata if available
    if (component.metadata) {
      console.log('Metadata:');
      for (const [key, value] of Object.entries(component.metadata)) {
        console.log(`  ${key}: ${value}`);
      }
    }
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
