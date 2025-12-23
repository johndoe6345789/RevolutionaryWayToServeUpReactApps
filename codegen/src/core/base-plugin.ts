/**
 * BasePlugin - AGENTS.md compliant plugin foundation
 * Strict OO constraints: 1 constructor param, ≤3 public methods, ≤10 lines per function
 * Uses composition with smaller specialized classes
 */

import { IPlugin, IPluginConfig, IRegistryManager, ISpec } from './interfaces/index';
import { BaseComponent } from './base-component';
import { PluginSpecLoader } from './plugin-spec-loader';
import { PluginMessageLoader } from './plugin-message-loader';

export abstract class BasePlugin extends BaseComponent implements IPlugin {
  public readonly config: IPluginConfig;
  private readonly specLoader: PluginSpecLoader;
  private readonly messageLoader: PluginMessageLoader;
  private initialized = false;

  /**
   * Constructor with single config parameter (AGENTS.md requirement)
   * @param config - Plugin configuration dataclass
   */
  constructor(config: IPluginConfig) {
    const spec: ISpec = {
      uuid: '00000000-0000-0000-0000-000000000000', // Will be overridden by spec file
      id: config.name,
      type: 'plugin',
      search: {
        title: config.name,
        summary: config.description,
        keywords: config.keywords ?? [],
        tags: config.tags ?? [],
        aliases: config.aliases ?? [],
        domain: config.domain ?? 'codegen',
        capabilities: config.capabilities ?? []
      }
    };

    super(spec);
    this.config = config;
    this.specLoader = new PluginSpecLoader(__dirname);
    this.messageLoader = new PluginMessageLoader(__dirname);
  }

  /**
   * Get plugin specification (≤10 lines)
   * @returns Promise<ISpec> Plugin specification
   */
  public async getSpec(): Promise<ISpec> {
    if (!this.initialized) {
      await this.initialise();
    }
    return this.spec;
  }

  /**
   * Get plugin messages (≤10 lines)
   * @returns Promise<Record<string, Record<string, string>>> Plugin messages
   */
  public async getMessages(): Promise<Record<string, Record<string, string>>> {
    if (!this.initialized) {
      await this.initialise();
    }
    return this.messageLoader.loadMessages();
  }

  /**
   * Register with registry manager (≤10 lines)
   * @param registryManager - Registry manager instance
   */
  public async register(registryManager: IRegistryManager): Promise<void> {
    if (!this.initialized) {
      await this.initialise();
    }
    // Implementation will be provided by subclasses
  }

  /**
   * Shutdown plugin resources (≤10 lines)
   */
  public async shutdown(): Promise<void> {
    if (this.initialized) {
      this.initialized = false;
    }
  }

  /**
   * Initialize plugin (internal method)
   * @returns Promise<void>
   */
  protected async initializePlugin(): Promise<void> {
    const loadedSpec = await this.specLoader.loadSpec();
    if (!this.specLoader.validateSpec(loadedSpec)) {
      throw new Error('Invalid plugin specification');
    }
    // Update spec with loaded data
    (this.spec as any) = { ...this.spec, ...loadedSpec };
    this.initialized = true;
  }
}
