/**
 * Plugin - AGENTS.md compliant plugin base class
 * Implements plugin contract: initialise, getSpec, register
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from './base-component';
import type { IPluginExecutionResult, IPluginRegistryManager } from './interfaces/index';
import type { ISpec } from './interfaces/ispec';

/**
 *
 */
export abstract class Plugin extends BaseComponent {
  protected initialised: boolean;
  protected specCache: unknown | null;

  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param spec - Plugin specification
   */
  constructor(spec: ISpec) {
    super(spec);
    this.initialised = false;
    this.specCache = null;
  }

  /**
   * Initialise plugin (plugin contract method, ≤10 lines)
   * @returns Promise<Plugin> Initialised plugin
   */
  public override async initialise(): Promise<Plugin> {
    await super.initialise();
    this.initialised = true;
    this.log(`Plugin ${this.id} initialised`);
    return this;
  }

  /**
   * Get plugin specification (plugin contract method, ≤10 lines)
   * @returns Plugin specification
   */
  public getSpec(): unknown {
    if (!this.specCache) {
      // Load spec from filesystem or embedded data
      this.specCache = this._loadSpec();
    }
    return this.specCache;
  }

  /**
   * Register with registry manager (plugin contract method, ≤10 lines)
   * @param registryManager - Registry manager instance
   */
  public async register(registryManager: IPluginRegistryManager): Promise<void> {
    if (!this.initialised) {
      await this.initialise();
    }

    const spec = this.getSpec();
    if (spec) {
      registryManager.register(this.id, spec);
      this.log(`Plugin ${this.id} registered`);
    }
  }

  /**
   * Execute plugin (extended from base, ≤10 lines)
   * @param context - Execution context
   * @returns Execution result
   */
  public override async execute(context: Record<string, unknown>): Promise<IPluginExecutionResult> {
    if (!this.initialised) {
      await this.initialise();
    }

    return {
      success: true,
      plugin: this.id,
      timestamp: new Date().toISOString(),
      output: {},
    };
  }

  /**
   * Load plugin specification (protected method, ≤10 lines)
   * @returns Plugin specification
   */
  protected _loadSpec(): unknown {
    // Default implementation - override in subclasses
    return this.spec;
  }

  /**
   * Log plugin message (convenience method, ≤10 lines)
   * @param message - Message to log
   * @param _level - Log level
   */
  protected log(message: string, _level: string = 'info'): void {
    const prefix = `[${this.id}]`;
    console.log(`${prefix} ${message}`);
  }
}
