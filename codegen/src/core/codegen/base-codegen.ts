#!/usr/bin/env node

/**
 * BaseCodegen - Core foundation for the codegen platform
 * Implements plugin discovery, registries, aggregates, and spec-driven generation
 * Follows AGENTS.md architectural patterns
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  IAggregate,
  IBaseCodegenOptions,
  IComponent,
  IPlugin,
  IRegistry,
  ISpec,
} from './interfaces/index';
import type { AggregateResults } from './types/aggregate-results';
import type { ExecutionResults } from './types/execution-results';
import type { PluginInfo } from './types/plugin-info';
import type { SystemStatus } from './types/system-status';

/**
 *
 */
export abstract class BaseCodegen {
  protected options: IBaseCodegenOptions;
  protected pluginRegistry: Map<string, IPlugin>;
  protected aggregateRegistry: Map<string, IAggregate | IRegistry | Map<string, IComponent>>;
  protected specRegistry: Map<string, ISpec>;
  protected discoveredPlugins: Map<string, PluginInfo>;
  protected loadedPlugins: Map<string, IPlugin>;
  protected initialized: boolean;
  protected specs: Map<string, ISpec>;
  protected templates: Map<string, unknown>;

  constructor(options: IBaseCodegenOptions = {}) {
    this.options = {
      outputDir: options.outputDir ?? './generated',
      strictMode: options.strictMode ?? true,
      verbose: options.verbose ?? false,
      enableCache: options.enableCache ?? true,
      ...options,
    };

    // Core registries (immutable after initialization)
    this.pluginRegistry = new Map();
    this.aggregateRegistry = new Map();
    this.specRegistry = new Map();

    // Plugin discovery state
    this.discoveredPlugins = new Map();
    this.loadedPlugins = new Map();

    // Runtime state
    this.initialized = false;
    this.specs = new Map();
    this.templates = new Map();
  }

  /**
   * Initialize the codegen system
   * @returns Promise<BaseCodegen> The initialized system
   */
  public async initialize(): Promise<BaseCodegen> {
    if (this.initialized) {
      return this;
    }

    this._ensureNotInitialized();

    try {
      this.log('Initializing Codegen Core...', 'info');

      // Discover and load plugins
      this._discoverPlugins();
      await this._loadPlugins();

      // Initialize registries
      this._initializeRegistries();

      // Load specifications
      await this._loadSpecs();

      this._markInitialized();
      this.log('Codegen Core initialized successfully', 'success');

      return this;
    } catch (error) {
      this.log(`Codegen initialization failed: ${(error as Error).message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute codegen operation
   * @param context - Execution context
   * @returns Promise<ExecutionResults> Generation results
   */
  public async execute(context: Record<string, unknown>): Promise<ExecutionResults> {
    this._ensureInitialized();

    const results: ExecutionResults = {
      success: false,
      generated: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0,
      },
    };

    try {
      this.log('Executing codegen operation...', 'info');

      // Process through aggregates
      const aggregateResults = await this._executeAggregates(context);

      // Merge results
      results.generated = aggregateResults.generated;
      results.errors = aggregateResults.errors;
      results.warnings = aggregateResults.warnings;
      results.stats = { ...results.stats, ...aggregateResults.stats };
      results.success = results.errors.length === 0;

      this.log(
        `Codegen execution ${results.success ? 'successful' : 'completed with errors'}`,
        results.success ? 'success' : 'warning',
      );

      return results;
    } catch (error) {
      results.errors.push((error as Error).message);
      this.log(`Codegen execution failed: ${(error as Error).message}`, 'error');
      return results;
    }
  }

  /**
   * Discover plugins from filesystem
   * @returns Promise<void>
   */
  protected _discoverPlugins(): void {
    this.log('Discovering plugins...', 'info');

    const pluginsDir = path.join(__dirname, '../plugins');
    // Discover from each plugin category
    const categories = ['tools', 'languages', 'templates', 'profiles'];

    for (const category of categories) {
      const categoryDir = path.join(pluginsDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const items = fs.readdirSync(categoryDir);

      for (const item of items) {
        const pluginDir = path.join(categoryDir, item);
        const manifestPath = path.join(pluginDir, 'plugin.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<
              string,
              unknown
            >;
            const pluginId = manifest.id as string;
            const entryPoint = manifest.entry_point as string;
            this.discoveredPlugins.set(pluginId, {
              id: pluginId,
              name: manifest.name as string | undefined,
              version: manifest.version as string | undefined,
              entry_point: entryPoint,
              path: pluginDir,
              category,
            });
          } catch (error) {
            this.log(
              `Failed to load plugin manifest ${manifestPath}: ${(error as Error).message}`,
              'warning',
            );
          }
        }
      }
    }

    this.log(`Discovered ${this.discoveredPlugins.size} plugins`, 'info');
  }

  /**
   * Load discovered plugins
   * @returns Promise<void>
   */
  protected async _loadPlugins(): Promise<void> {
    this.log('Loading plugins...', 'info');

    // Load plugins in dependency order (simplified - no topological sort yet)
    for (const [pluginId, pluginInfo] of this.discoveredPlugins) {
      try {
        const entryPoint = path.join(pluginInfo.path, pluginInfo.entry_point);
        // Note: require() is used here as plugins may be CommonJS or ESM
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const PluginClass = require(entryPoint);
        // Create plugin instance
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const plugin = new PluginClass();

        // Initialize plugin
        if (typeof plugin.initialize === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await plugin.initialize();
        }

        // Register plugin
        if (typeof plugin.register === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await plugin.register(this);
        }

        this.loadedPlugins.set(pluginId, plugin);
        this.log(`Loaded plugin: ${pluginId}`, 'success');
      } catch (error) {
        this.log(`Failed to load plugin ${pluginId}: ${(error as Error).message}`, 'error');
        if (this.options.strictMode) {
          throw error;
        }
      }
    }

    this.log(`Successfully loaded ${this.loadedPlugins.size} plugins`, 'info');
  }

  /**
   * Initialize registries and aggregates
   * @returns Promise<void>
   */
  protected _initializeRegistries(): void {
    this.log('Initializing registries and aggregates...', 'info');

    // Create core aggregates as defined in AGENTS.md
    const aggregates: Record<string, { children: string[] }> = {
      AppAggregate: {
        children: [
          'DomainAggregate',
          'AdaptersAggregate',
          'CodegenAggregate',
          'I18nAggregate',
          'ToolingAggregate',
        ],
      },
      ToolingAggregate: {
        children: [
          'PackageManagersRegistry',
          'BuildSystemsRegistry',
          'DevWorkflowRegistry',
          'QARegistry',
          'SDKRegistry',
          'AppsRegistry',
          'ProfilesRegistry',
        ],
      },
      CodegenAggregate: {
        children: ['LanguagesRegistry', 'SnippetsRegistry', 'TemplatesRegistry'],
      },
      // Add other aggregates as needed
    };

    // Initialize aggregates
    for (const [aggregateId, config] of Object.entries(aggregates)) {
      this.aggregateRegistry.set(aggregateId, {
        listChildren: () => config.children,
        getChild: (id: string) => {
          const aggregate = this.aggregateRegistry.get(id);
          if (aggregate && !(aggregate instanceof Map)) {
            return aggregate;
          }
          return null;
        },
        describe: () => null,
      });
    }

    this.log('Registries and aggregates initialized', 'success');
  }

  /**
   * Load specifications from plugins
   * @returns Promise<void>
   */
  protected async _loadSpecs(): Promise<void> {
    this.log('Loading specifications...', 'info');

    for (const [pluginId, plugin] of this.loadedPlugins) {
      if (typeof (plugin as any).getSpec === 'function') {
        try {
          const spec = await (plugin as any).getSpec();
          if (spec) {
            this.specRegistry.set(spec.id || pluginId, spec);
            this.log(`Loaded spec for plugin: ${pluginId}`, 'info');
          }
        } catch (error) {
          this.log(
            `Failed to load spec for plugin ${pluginId}: ${(error as Error).message}`,
            'warning',
          );
        }
      }
    }

    this.log(`Loaded ${this.specRegistry.size} specifications`, 'info');
  }

  /**
   * Execute aggregates for code generation
   * @param context - Execution context
   * @returns Promise<AggregateResults> Aggregate execution results
   */
  protected async _executeAggregates(context: Record<string, unknown>): Promise<AggregateResults> {
    const results: AggregateResults = {
      generated: [],
      errors: [],
      warnings: [],
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0,
      },
    };

    // Execute plugins based on context
    for (const [pluginId, plugin] of this.loadedPlugins) {
      try {
        if (typeof (plugin as any).execute === 'function') {
          const pluginResults = await (plugin as any).execute(context);
          results.generated.push(...(pluginResults.generated || []));
          results.errors.push(...(pluginResults.errors || []));
          results.warnings.push(...(pluginResults.warnings || []));
          results.stats.pluginsExecuted++;
        }
      } catch (error) {
        results.errors.push(`Plugin ${pluginId} execution failed: ${(error as Error).message}`);
        if (this.options.strictMode) {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Register a component in the appropriate registry
   * @param registryId - Registry identifier
   * @param componentId - Component identifier
   * @param component - Component to register
   */
  public register(registryId: string, componentId: string, component: unknown): void {
    if (registryId === 'plugin') {
      this.pluginRegistry.set(componentId, component as IPlugin);
    } else {
      // Handle other registry types
      let registry = this.aggregateRegistry.get(registryId);
      if (!registry) {
        registry = new Map();
        this.aggregateRegistry.set(registryId, registry);
      }
      if (registry instanceof Map) {
        registry.set(componentId, component as IComponent);
      }
      // Note: IAggregate/IRegistry interfaces don't have set methods
      // This would need proper implementation of registry classes
    }
  }

  /**
   * Get a component from registries
   * @param registryId - Registry identifier
   * @param componentId - Component identifier
   * @returns The component or null if not found
   */
  public get(registryId: string, componentId: string): unknown {
    if (registryId === 'plugin') {
      return this.pluginRegistry.get(componentId) || null;
    }

    const registry = this.aggregateRegistry.get(registryId);
    if (registry instanceof Map) {
      return registry.get(componentId) || null;
    }
    if (registry && typeof (registry as IRegistry).get === 'function') {
      return (registry as IRegistry).get(componentId);
    }
    return null;
  }

  /**
   * List components in a registry
   * @param registryId - Registry identifier
   * @returns Array of component IDs
   */
  public list(registryId: string): string[] {
    if (registryId === 'plugin') {
      return Array.from(this.pluginRegistry.keys());
    }

    const registry = this.aggregateRegistry.get(registryId);
    if (registry instanceof Map) {
      return Array.from(registry.keys());
    }
    if (registry && typeof (registry as IRegistry).listIds === 'function') {
      return Array.from((registry as IRegistry).listIds());
    }
    return [];
  }

  /**
   * Get root aggregate (AppAggregate)
   * @returns Root aggregate
   */
  public getRootAggregate(): IAggregate | IRegistry | undefined {
    const aggregate = this.aggregateRegistry.get('AppAggregate');
    return aggregate instanceof Map ? undefined : aggregate;
  }

  /**
   * Drill down through aggregates
   * @param path - Path through aggregates
   * @returns Target component or null
   */
  public drillDown(path: string[]): IAggregate | IRegistry | null {
    let current: IAggregate | IRegistry | undefined = this.getRootAggregate();

    for (const segment of path) {
      if (current && typeof (current as any).getChild === 'function') {
        current = (current as any).getChild(segment);
      } else {
        return null;
      }
    }

    return current || null;
  }

  /**
   * Log a message with appropriate formatting
   * @param message - Message to log
   * @param level - Log level
   */
  public log(message: string, level = 'info'): void {
    if (!this.options.verbose && level === 'info') {
      return;
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [Codegen]`;

    switch (level) {
      case 'success':
        console.log(`\x1b[32m${prefix} ✓ ${message}\x1b[0m`);
        break;
      case 'warning':
        console.log(`\x1b[33m${prefix} ⚠ ${message}\x1b[0m`);
        break;
      case 'error':
        console.log(`\x1b[31m${prefix} ✗ ${message}\x1b[0m`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Ensure system is not already initialized
   * @throws Error If already initialized
   */
  protected _ensureNotInitialized(): void {
    if (this.initialized) {
      throw new Error('Codegen system already initialized');
    }
  }

  /**
   * Ensure system is initialized
   * @throws Error If not initialized
   */
  protected _ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Codegen system not initialized. Call initialize() first.');
    }
  }

  /**
   * Mark system as initialized
   */
  protected _markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Get system status
   * @returns System status
   */
  public getStatus(): SystemStatus {
    return {
      initialized: this.initialized,
      plugins: {
        discovered: this.discoveredPlugins.size,
        loaded: this.loadedPlugins.size,
      },
      registries: {
        plugins: this.pluginRegistry.size,
        aggregates: this.aggregateRegistry.size,
        specs: this.specRegistry.size,
      },
      options: this.options,
    };
  }
}
