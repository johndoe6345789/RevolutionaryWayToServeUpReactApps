/**
 * PluginManager - Manages plugin discovery and loading
 * Implements IStandardLifecycle with lifecycle builder integration
 * Replaces legacy PluginAggregator
 */

import { BaseComponent } from '../codegen/base-component';
import type { IStandardLifecycle } from '../interfaces/index';

/**
 * PluginManager - Manages plugin lifecycle and discovery
 */
export class PluginManager extends BaseComponent implements IStandardLifecycle {
  private readonly plugins = new Map<string, IStandardLifecycle>();

  /**
   * Constructor with spec
   * @param spec
   */
  constructor(spec: any) {
    super(spec);
  }

  /**
   * Initialise - Load and initialise plugins
   */
  public override async initialise(): Promise<void> {
    await super.initialise();
    // Plugin loading logic would go here
    this.plugins.set('example-plugin', {} as IStandardLifecycle);
  }

  /**
   * Validate - Validate plugin configurations
   */
  public override async validate(): Promise<void> {
    await super.validate();
    // Validation logic
  }

  /**
   * Execute - Execute plugin operations
   */
  public override async execute(): Promise<unknown> {
    // Plugin execution logic
    return { pluginsLoaded: this.plugins.size };
  }

  /**
   * Cleanup - Clean up plugin resources
   */
  public override async cleanup(): Promise<void> {
    this.plugins.clear();
    await super.cleanup();
  }

  /**
   * Get loaded plugins
   */
  public getPlugins(): Map<string, IStandardLifecycle> {
    return this.plugins;
  }
}
