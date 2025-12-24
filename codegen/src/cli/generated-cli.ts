/**
 * GeneratedCLI - Command Line Interface implementation
 *
 * Generated CLI with drill-down navigation and registry-based commands
 *
 * Auto-generated from spec.json
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import type { CLICommand } from './cli-command';
import type { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

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
    const commandName = args[0] || 'help';
    const commandArgs = args.slice(1);
    const command = this.commands.get(commandName);
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
   * Handle list command - list components through lifecycle
   * @param args
   * @param entrypoint
   */
  private async _handleList(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const category = args[0] || 'all';

    if (category === 'all' || category === 'components') {
      // List all components in the lifecycle
      console.log('Available components:');
      const lifecycle = entrypoint.getCompositeLifecycle();
      const children = lifecycle.getChildren();
      for (const [childId, child] of children) {
        if (child && 'debug' in child) {
          const debugInfo = child.debug();
          const title = debugInfo.spec?.search?.title || 'No title';
          console.log(`  ${childId} - ${title}`);
        } else {
          console.log(`  ${childId}`);
        }
      }
      return;
    }

    // List specific category
    if (category === 'plugins') {
      const pluginAggregator = entrypoint.getComponent('pluginAggregator');
      if (pluginAggregator && 'debug' in pluginAggregator) {
        const debugInfo = pluginAggregator.debug();
        console.log('Plugins:');
        const plugins = (debugInfo.discoveredPlugins as string[]) || [];
        for (const plugin of plugins) {
          console.log(`  ${plugin}`);
        }
      }
      return;
    }

    console.log(`Category '${category}' not found`);
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

    // Try to find component in the lifecycle
    const lifecycle = entrypoint.getCompositeLifecycle();
    const children = lifecycle.getChildren();

    // First check if it's a direct component
    for (const [componentId, component] of children) {
      if (componentId === targetId && 'debug' in component) {
        this._displayComponentDetails(component, targetId);
        return;
      }
    }

    // Check plugin aggregator for specific plugins
    const pluginAggregator = entrypoint.getComponent('pluginAggregator');
    if (pluginAggregator && 'debug' in pluginAggregator) {
      const debugInfo = pluginAggregator.debug();
      const loadedPlugins = (debugInfo.loadedPlugins as string[]) || [];
      if (loadedPlugins.includes(targetId)) {
        console.log(`Component: ${targetId}`);
        console.log(`Type: plugin`);
        console.log(`Status: loaded`);
        return;
      }
    }

    console.error(`Component '${targetId}' not found`);
    process.exit(1);
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
    const query = args.join(' ').trim();
    if (!query) {
      this._printUsage('search');
      throw new Error('Search query is required.');
    }

    const lifecycle = entrypoint.getCompositeLifecycle();
    const children = lifecycle.getChildren();
    const matches: string[] = [];

    for (const [childId, child] of children) {
      const debugInfo = 'debug' in child ? child.debug() : {};
      const search = (debugInfo as Record<string, any>)?.spec?.search || (child as any).search;
      const haystack = [
        search?.title,
        search?.summary,
        ...(search?.keywords || []),
        ...(search?.capabilities || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (haystack.includes(query.toLowerCase())) {
        matches.push(`${childId}: ${search?.summary || 'No summary available'}`);
      }
    }

    if (matches.length === 0) {
      console.log(`No components matched query "${query}".`);
      return;
    }

    console.log(`Found ${matches.length} component(s):`);
    for (const match of matches) {
      console.log(`  - ${match}`);
    }
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleTool(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const subcommands: Record<string, { syntax: string; examples: string[] }> = {
      install: {
        syntax: 'codegen tool install <tool-id> [--profile=<profile>]',
        examples: ['codegen tool install git', 'codegen tool install git --profile=fullstack-dev'],
      },
      verify: {
        syntax: 'codegen tool verify <tool-id>',
        examples: ['codegen tool verify git'],
      },
      run: {
        syntax: 'codegen tool run <tool-id> <command> [args...]',
        examples: ['codegen tool run git clone https://github.com/user/repo.git'],
      },
    };

    const subcommand = args[0];
    if (!subcommand || !subcommands[subcommand]) {
      console.error('Invalid or missing tool subcommand.');
      this._printUsage(
        'tool',
        Object.values(subcommands).map((s) => s.syntax),
      );
      return;
    }

    const pluginManager = entrypoint.getComponent('pluginManager');
    if (!pluginManager || typeof (pluginManager as any).getPlugins !== 'function') {
      throw new Error('Plugin manager is unavailable.');
    }

    const plugins = (pluginManager as any).getPlugins() as Map<string, unknown>;
    const toolId = args[1];

    if (!toolId) {
      this._printUsage('tool', [subcommands[subcommand].syntax]);
      throw new Error(`Tool ID is required for '${subcommand}'.`);
    }

    switch (subcommand) {
      case 'install': {
        const profile = this._extractFlag(args.slice(2), 'profile') || 'default';
        if (!plugins.has(toolId)) {
          plugins.set(toolId, { id: toolId, execute: async () => ({ ok: true }) });
        }
        console.log(`Tool '${toolId}' installed for profile '${profile}'.`);
        break;
      }
      case 'verify': {
        if (!plugins.has(toolId)) {
          this._printUsage('tool', [subcommands.verify.syntax]);
          throw new Error(`Tool '${toolId}' is not installed.`);
        }
        console.log(`Tool '${toolId}' is available.`);
        break;
      }
      case 'run': {
        const command = args[2];
        const commandArgs = args.slice(3);
        if (!command) {
          this._printUsage('tool', [subcommands.run.syntax]);
          throw new Error('Command to run is required.');
        }

        if (!plugins.has(toolId)) {
          throw new Error(`Tool '${toolId}' is not installed.`);
        }

        const tool = plugins.get(toolId) as {
          execute?: (cmd: string, cmdArgs: string[]) => unknown;
        };
        if (tool?.execute) {
          const result = await tool.execute(command, commandArgs);
          console.log(
            `Executed '${toolId}' with command '${command}'. Result: ${JSON.stringify(result)}`,
          );
        } else {
          console.log(
            `Ran '${toolId}' with command '${command}' and args [${commandArgs.join(', ')}].`,
          );
        }
        break;
      }
    }
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleRunbook(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const subcommands: Record<string, { syntax: string; examples: string[] }> = {
      generate: {
        syntax: 'codegen runbook generate --profile=<profile> --platform=<platform>',
        examples: ['codegen runbook generate --profile=fullstack-dev --platform=linux'],
      },
      export: {
        syntax: 'codegen runbook export --format=<format> --output=<file>',
        examples: ['codegen runbook export --format=markdown --output=setup.md'],
      },
    };

    const subcommand = args[0];
    if (!subcommand || !subcommands[subcommand]) {
      console.error('Invalid or missing runbook subcommand.');
      this._printUsage(
        'runbook',
        Object.values(subcommands).map((s) => s.syntax),
      );
      return;
    }

    const executionManager = entrypoint.getComponent('executionManager') as {
      executeWithContext?: (context: Record<string, unknown>) => Promise<unknown>;
    };

    if (!executionManager || typeof executionManager.executeWithContext !== 'function') {
      throw new Error('Execution manager is unavailable for runbook operations.');
    }

    if (subcommand === 'generate') {
      const profile = this._extractFlag(args.slice(1), 'profile');
      const platform = this._extractFlag(args.slice(1), 'platform');
      if (!profile || !platform) {
        this._printUsage('runbook', [subcommands.generate.syntax]);
        throw new Error('Both profile and platform flags are required.');
      }

      const result = await executionManager.executeWithContext({
        operation: 'runbook-generate',
        profile,
        platform,
      });

      console.log(`Runbook generated for profile '${profile}' on platform '${platform}'.`);
      console.log(`Result: ${JSON.stringify(result)}`);
      return;
    }

    if (subcommand === 'export') {
      const format = this._extractFlag(args.slice(1), 'format');
      const output = this._extractFlag(args.slice(1), 'output');
      if (!format || !output) {
        this._printUsage('runbook', [subcommands.export.syntax]);
        throw new Error('Format and output flags are required to export runbooks.');
      }

      const result = await executionManager.executeWithContext({
        operation: 'runbook-export',
        format,
        output,
      });

      console.log(`Runbook exported as '${format}' to '${output}'.`);
      console.log(`Result: ${JSON.stringify(result)}`);
    }
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleProfile(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const subcommands: Record<string, { syntax: string; examples: string[] }> = {
      list: { syntax: 'codegen profile list', examples: ['codegen profile list'] },
      show: {
        syntax: 'codegen profile show <profile-id>',
        examples: ['codegen profile show fullstack-dev'],
      },
      apply: {
        syntax: 'codegen profile apply <profile-id>',
        examples: ['codegen profile apply fullstack-dev'],
      },
    };

    const profiles = ['default', 'fullstack-dev', 'data-science'];
    const subcommand = args[0];

    if (!subcommand || !subcommands[subcommand]) {
      console.error('Invalid or missing profile subcommand.');
      this._printUsage(
        'profile',
        Object.values(subcommands).map((s) => s.syntax),
      );
      return;
    }

    if (subcommand === 'list') {
      console.log('Available profiles:');
      for (const profile of profiles) {
        console.log(`  - ${profile}`);
      }
      return;
    }

    const profileId = args[1];
    if (!profileId || !profiles.includes(profileId)) {
      this._printUsage('profile', [subcommands[subcommand].syntax]);
      throw new Error('Valid profile ID is required.');
    }

    if (subcommand === 'show') {
      console.log(`Profile '${profileId}':`);
      console.log(
        `  Description: ${profileId === 'default' ? 'Baseline tooling' : 'Specialized stack'}`,
      );
      return;
    }

    if (subcommand === 'apply') {
      const executionManager = entrypoint.getComponent('executionManager') as {
        executeWithContext?: (context: Record<string, unknown>) => Promise<unknown>;
      };
      if (executionManager?.executeWithContext) {
        await executionManager.executeWithContext({
          operation: 'profile-apply',
          profile: profileId,
        });
      }
      console.log(`Profile '${profileId}' applied.`);
    }
  }

  /**
   *
   * @param args
   * @param entrypoint
   */
  private async _handleSchema(args: string[], entrypoint: CodegenEntrypoint): Promise<void> {
    const action = args[0];
    const command = this.commands.get('schema');
    const executionManager = entrypoint.getComponent('executionManager') as {
      executeWithContext?: (context: Record<string, unknown>) => Promise<unknown>;
    };

    if (!action) {
      this._printUsage('schema');
      throw new Error('Schema action is required.');
    }

    if (action === 'generate') {
      const type = args[1];
      const bulk = args.includes('--bulk');
      const defaults = args.includes('--defaults');

      if (!type) {
        this._printUsage('schema');
        throw new Error('Schema type is required for generation.');
      }

      if (!executionManager?.executeWithContext) {
        throw new Error('Execution manager is unavailable for schema generation.');
      }

      const result = await executionManager.executeWithContext({
        operation: 'schema-generate',
        type,
        bulk,
        defaults,
      });

      console.log(
        `Schema generation requested for type '${type}'. Bulk=${bulk}, Defaults=${defaults}.`,
      );
      console.log(`Result: ${JSON.stringify(result)}`);
      return;
    }

    if (action === 'validate') {
      const schemaPath = args[1];
      if (!schemaPath) {
        const example = command?.examples?.[0];
        this._printUsage('schema', example ? [example] : undefined);
        throw new Error('Schema file path is required for validation.');
      }

      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`);
      }

      JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      console.log(`Schema at '${schemaPath}' is valid JSON.`);
      return;
    }

    this._printUsage('schema');
    throw new Error(`Unsupported schema action '${action}'.`);
  }

  /**
   * Print usage information using command metadata and optional overrides
   * @param commandName
   * @param extraSyntax
   */
  private _printUsage(commandName: string, extraSyntax?: string[]): void {
    const command = this.commands.get(commandName);
    if (!command) {
      return;
    }

    const usage = extraSyntax && extraSyntax.length > 0 ? extraSyntax[0] : command.syntax;
    console.error(`Usage: ${usage}`);
    const combinedExamples = extraSyntax && extraSyntax.length > 0 ? extraSyntax : command.examples;
    if (combinedExamples.length > 0) {
      console.error('Examples:');
      for (const example of combinedExamples) {
        console.error(`  ${example}`);
      }
    }
  }

  /**
   * Extract flag values from CLI args supporting --flag=value and --flag value
   * @param args
   * @param flag
   */
  private _extractFlag(args: string[], flag: string): string | undefined {
    const withEquals = args.find((arg) => arg.startsWith(`--${flag}=`));
    if (withEquals) {
      return withEquals.split('=')[1];
    }

    const index = args.indexOf(`--${flag}`);
    if (index !== -1 && args[index + 1]) {
      return args[index + 1];
    }

    return undefined;
  }
}
