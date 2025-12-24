#!/usr/bin/env node

/**
 * CodegenEntrypoint - Main CLI/web entry point
 * Revolutionary Codegen system entry point with lifecycle builder management
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from '../core/codegen/base-component';
import { ExecutionManager } from '../core/codegen/execution-manager';
import { PluginManager } from '../core/plugins/plugin-manager';
import type { LifecycleBuilder } from '../core/types/lifecycle-builder';
import type { CompositeLifecycle } from '../core/types/composite-lifecycle';
import type { CLIArgs } from './types/cli-args';
import type { CodegenOptions } from './types/codegen-options';
import { findExecutionManager, findPluginManager } from './component-utils';

/**
 * CodegenEntrypoint - Uses lifecycle builder for component orchestration
 */
export class CodegenEntrypoint extends BaseComponent {
  private readonly lifecycleBuilder: LifecycleBuilder;
  private compositeLifecycle?: CompositeLifecycle;

  constructor(lifecycleBuilder: LifecycleBuilder, options: CodegenOptions = {}) {
    super({
      uuid: '12345678-1234-4123-8123-123456789012',
      id: 'codegen-entrypoint',
      type: 'entrypoint',
      search: {
        title: 'CodegenEntrypoint',
        summary: 'Main entry point for Revolutionary Codegen',
        keywords: ['codegen', 'entrypoint', 'cli'],
        domain: 'core',
        capabilities: ['cli', 'navigation'],
      },
    });

    this.lifecycleBuilder = lifecycleBuilder;
  }

  /**
   *
   */
  public override async initialise(): Promise<CodegenEntrypoint> {
    await super.initialise();
    return this;
  }

  /**
   *
   * @param args
   */
  public async runCLI(args: string[]): Promise<void> {
    const { command, options } = this.parseCommand(args);
    try {
      await this.initialise();
      await this.dispatchCommand(command, options);
    } catch (error) {
      throw new Error(`CLI execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get the lifecycle builder
   */
  public getLifecycleBuilder(): LifecycleBuilder {
    return this.lifecycleBuilder;
  }

  /**
   * Get the composite lifecycle (builds it if not already built)
   */
  public getCompositeLifecycle(): CompositeLifecycle {
    this.compositeLifecycle ||= this.lifecycleBuilder.build();
    return this.compositeLifecycle;
  }

  /**
   * Get a component by name from the lifecycle
   */
  public getComponent<TComponent extends BaseComponent = BaseComponent>(name: string): TComponent | undefined {
    const children = this.getCompositeLifecycle().getChildren();
    const component = children.get(name);
    return component instanceof BaseComponent ? (component as TComponent) : undefined;
  }

  /**
   *
   * @param options
   */
  private async handleGenerate(options: CLIArgs): Promise<void> {
    const executionManager = findExecutionManager(this);
    if (!executionManager) return;

    await executionManager.executeWithContext(createGenerateContext(options));
  }

  /**
   *
   * @param _options
   */
  private async handleList(options: CLIArgs): Promise<void> {
    const pluginManager = findPluginManager(this);
    if (!pluginManager) return;

    const category = options.category || 'all';
    if (category === 'plugins' || category === 'all') this.logComponents(pluginManager, 'Plugins');
    if (category === 'tools' || category === 'all') this.logComponents(pluginManager, 'Tools');
  }

  /**
   *
   * @param options
   */
  private async handleDescribe(options: CLIArgs): Promise<void> {
    const componentId = options.component;
    if (!componentId) return;

    if (this.describePlugin(componentId)) return;
    if (this.describeExecution(componentId)) return;

    console.log(`Component '${componentId}' not found`);
  }

  /**
   *
   * @param options
   */
  private async handleSearch(options: CLIArgs): Promise<void> {
    if (!options.query) {
      console.log('Search query required');
      return;
    }

    console.log(`Searching for '${options.query}'...`);
  }

  /**
   *
   * @param args
   */
  private parseCLIArgs(args: string[]): CLIArgs {
    const options: CLIArgs = {};
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (!arg.startsWith('--') && !options.component) options.component = arg;
      else if (arg.startsWith('--')) options[arg.slice(2)] = this.readOption(args, i);
    }
    return options;
  }

  /**
   *
   */
  private displayHelp(): void {
    console.log('Usage: codegen <command> [options]');
  }

  private describePlugin(componentId: string): boolean {
    const pluginManager = findPluginManager(this);
    if (!pluginManager) return false;

    const hasPlugin = pluginManager.getPlugins().has(componentId);
    if (hasPlugin) console.log(`Component: ${componentId} (Plugin)`);
    return hasPlugin;
  }

  private describeExecution(componentId: string): boolean {
    const executionManager = findExecutionManager(this);
    if (!executionManager) return false;

    console.log(`Component: ${componentId} (Execution)`);
    console.log('Debug Info:', executionManager.debug());
    return true;
  }

  private dispatchCommand(command: string, options: CLIArgs): Promise<void> {
    const handlers: Record<string, (cliOptions: CLIArgs) => Promise<void> | void> = {
      describe: (cliOptions) => this.handleDescribe(cliOptions),
      generate: (cliOptions) => this.handleGenerate(cliOptions),
      help: () => this.displayHelp(),
      list: (cliOptions) => this.handleList(cliOptions),
      search: (cliOptions) => this.handleSearch(cliOptions),
    };
    return Promise.resolve((handlers[command] ?? this.displayHelp.bind(this))(options));
  }

  private logComponents(pluginManager: PluginManager, label: string): void {
    console.log(`${label}:`, Array.from(pluginManager.getPlugins().keys()));
  }

  private parseCommand(args: string[]): { command: string; options: CLIArgs } {
    const [command = 'help', ...rest] = args;
    return { command, options: this.parseCLIArgs(rest) };
  }

  private readOption(args: string[], index: number): string | boolean {
    const value = args[index + 1];
    return value && !value.startsWith('--') ? value : true;
  }
}

const createGenerateContext = (options: CLIArgs): Record<string, unknown> => ({
  operation: 'generate',
  specPath: options.spec,
  outputDir: options.output,
  language: options.language,
  profile: options.profile,
  template: options.template,
});
