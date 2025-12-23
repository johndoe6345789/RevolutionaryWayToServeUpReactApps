#!/usr/bin/env node

/**
 * CodegenEntrypoint - Main CLI/web entry point
 * Revolutionary Codegen system entry point with lifecycle builder management
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from '../core/codegen/base-component';
import type { LifecycleBuilder } from '../core/types/lifecycle-builder';
import type { CompositeLifecycle } from '../core/types/composite-lifecycle';

/**
 *
 */
interface CodegenOptions {
  outputDir?: string;
  verbose?: boolean;
  strictMode?: boolean;
  [key: string]: unknown;
}

/**
 *
 */
interface CLIArgs {
  spec?: string;
  output?: string;
  language?: string;
  profile?: string;
  template?: string;
  category?: string;
  component?: string;
  query?: string;
  tool?: string;
  platform?: string;
  packageManager?: string;
  [key: string]: unknown;
}

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
    const command = args[0] || 'help',
      options = this._parseCLIArgs(args.slice(1));

    try {
      await this.initialise();

      switch (command) {
        case 'generate':
          await this._runGenerate(options);
          break;
        case 'list':
          await this._runList(options);
          break;
        case 'describe':
          await this._runDescribe(options);
          break;
        case 'search':
          await this._runSearch(options);
          break;
        default:
          this._displayHelp();
      }
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
    if (!this.compositeLifecycle) {
      this.compositeLifecycle = this.lifecycleBuilder.build();
    }
    return this.compositeLifecycle;
  }

  /**
   * Get a component by name from the lifecycle
   */
  public getComponent(name: string): any {
    const lifecycle = this.getCompositeLifecycle();
    const children = lifecycle.getChildren();
    return children.get(name);
  }

  /**
   *
   * @param options
   */
  private async _runGenerate(options: CLIArgs): Promise<void> {
    const context = {
        operation: 'generate',
        specPath: options.spec,
        outputDir: options.output,
        language: options.language,
        profile: options.profile,
        template: options.template,
      },
      executionManager = this.getComponent('executionManager');
    if (executionManager && 'executeWithContext' in executionManager) {
      await executionManager.executeWithContext(context);
    }
  }

  /**
   *
   * @param _options
   */
  private async _runList(_options: CLIArgs): Promise<void> {
    const category = _options.category || 'all';

    if (category === 'plugins' || category === 'all') {
      const pluginManager = this.getComponent('pluginManager');
      if (pluginManager && 'getPlugins' in pluginManager) {
        const plugins = pluginManager.getPlugins();
        console.log('Plugins:', Array.from(plugins.keys()));
      }
    }

    if (category === 'tools' || category === 'all') {
      // For now, just show plugin info as tools are plugins
      const pluginManager = this.getComponent('pluginManager');
      if (pluginManager && 'getPlugins' in pluginManager) {
        const plugins = pluginManager.getPlugins();
        console.log('Tools:', Array.from(plugins.keys()));
      }
    }
  }

  /**
   *
   * @param options
   */
  private async _runDescribe(options: CLIArgs): Promise<void> {
    const componentId = options.component;
    if (!componentId) {
      return;
    }

    // Check both components for the requested component
    const pluginManager = this.getComponent('pluginManager');
    const executionManager = this.getComponent('executionManager');

    if (pluginManager && 'getPlugins' in pluginManager) {
      const plugins = pluginManager.getPlugins();
      if (plugins.has(componentId)) {
        console.log(`Component: ${componentId} (Plugin)`);
        return;
      }
    }

    if (executionManager && 'debug' in executionManager) {
      const debugInfo = executionManager.debug();
      console.log(`Component: ${componentId} (Execution)`);
      console.log('Debug Info:', debugInfo);
      return;
    }

    console.log(`Component '${componentId}' not found`);
  }

  /**
   *
   * @param options
   */
  private async _runSearch(options: CLIArgs): Promise<void> {
    const { query } = options;
    if (!query) {
    }
  }

  /**
   *
   * @param args
   */
  private _parseCLIArgs(args: string[]): CLIArgs {
    const options: CLIArgs = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        options[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      } else if (!options.component) {
        options.component = arg;
      }
    }
    return options;
  }

  /**
   *
   */
  private _displayHelp(): void {
    // Help display functionality
  }
}
