#!/usr/bin/env node

/**
 * BaseCodegen - Core foundation for the codegen platform
 * Implements plugin discovery, registries, aggregates, and spec-driven generation
 * Follows AGENTS.md architectural patterns
 */

const fs = require('fs');
const path = require('path');

class BaseCodegen {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './generated',
      strictMode: options.strictMode !== false,
      verbose: options.verbose || false,
      enableCache: options.enableCache !== false,
      ...options
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
   * @returns {Promise<BaseCodegen>} The initialized system
   */
  async initialize() {
    if (this.initialized) {
      return this;
    }

    this._ensureNotInitialized();

    try {
      this.log('Initializing Codegen Core...', 'info');

      // Discover and load plugins
      await this._discoverPlugins();
      await this._loadPlugins();

      // Initialize registries
      await this._initializeRegistries();

      // Load specifications
      await this._loadSpecs();

      this._markInitialized();
      this.log('Codegen Core initialized successfully', 'success');

      return this;
    } catch (error) {
      this.log(`Codegen initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute codegen operation
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Generation results
   */
  async execute(context) {
    this._ensureInitialized();

    const results = {
      success: false,
      generated: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0
      }
    };

    try {
      this.log('Executing codegen operation...', 'info');

      // Process through aggregates
      const aggregateResults = await this._executeAggregates(context);

      // Merge results
      results.generated = aggregateResults.generated || [];
      results.errors = aggregateResults.errors || [];
      results.warnings = aggregateResults.warnings || [];
      results.stats = { ...results.stats, ...aggregateResults.stats };
      results.success = results.errors.length === 0;

      this.log(`Codegen execution ${results.success ? 'successful' : 'completed with errors'}`, results.success ? 'success' : 'warning');

      return results;
    } catch (error) {
      results.errors.push(error.message);
      this.log(`Codegen execution failed: ${error.message}`, 'error');
      return results;
    }
  }

  /**
   * Discover plugins from filesystem
   * @returns {Promise<void>}
   */
  async _discoverPlugins() {
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
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            this.discoveredPlugins.set(manifest.id, {
              ...manifest,
              path: pluginDir,
              category
            });
          } catch (error) {
            this.log(`Failed to load plugin manifest ${manifestPath}: ${error.message}`, 'warning');
          }
        }
      }
    }

    this.log(`Discovered ${this.discoveredPlugins.size} plugins`, 'info');
  }

  /**
   * Load discovered plugins
   * @returns {Promise<void>}
   */
  async _loadPlugins() {
    this.log('Loading plugins...', 'info');

    // Load plugins in dependency order (simplified - no topological sort yet)
    for (const [pluginId, pluginInfo] of this.discoveredPlugins) {
      try {
        const entryPoint = path.join(pluginInfo.path, pluginInfo.entry_point);
        const PluginClass = require(entryPoint);

        // Create plugin instance
        const plugin = new PluginClass();

        // Initialize plugin
        if (typeof plugin.initialize === 'function') {
          await plugin.initialize();
        }

        // Register plugin
        if (typeof plugin.register === 'function') {
          await plugin.register(this);
        }

        this.loadedPlugins.set(pluginId, plugin);
        this.log(`Loaded plugin: ${pluginId}`, 'success');

      } catch (error) {
        this.log(`Failed to load plugin ${pluginId}: ${error.message}`, 'error');
        if (this.options.strictMode) {
          throw error;
        }
      }
    }

    this.log(`Successfully loaded ${this.loadedPlugins.size} plugins`, 'info');
  }

  /**
   * Initialize registries and aggregates
   * @returns {Promise<void>}
   */
  async _initializeRegistries() {
    this.log('Initializing registries and aggregates...', 'info');

    // Create core aggregates as defined in AGENTS.md
    const aggregates = {
      'AppAggregate': {
        children: ['DomainAggregate', 'AdaptersAggregate', 'CodegenAggregate', 'I18nAggregate', 'ToolingAggregate']
      },
      'ToolingAggregate': {
        children: ['PackageManagersRegistry', 'BuildSystemsRegistry', 'DevWorkflowRegistry', 'QARegistry', 'SDKRegistry', 'AppsRegistry', 'ProfilesRegistry']
      },
      'CodegenAggregate': {
        children: ['LanguagesRegistry', 'SnippetsRegistry', 'TemplatesRegistry']
      }
      // Add other aggregates as needed
    };

    // Initialize aggregates
    for (const [aggregateId, config] of Object.entries(aggregates)) {
      this.aggregateRegistry.set(aggregateId, {
        id: aggregateId,
        type: 'aggregate',
        children: config.children,
        listChildren: () => config.children,
        getChild: (id) => this.aggregateRegistry.get(id) || this.pluginRegistry.get(id)
      });
    }

    this.log('Registries and aggregates initialized', 'success');
  }

  /**
   * Load specifications from plugins
   * @returns {Promise<void>}
   */
  async _loadSpecs() {
    this.log('Loading specifications...', 'info');

    for (const [pluginId, plugin] of this.loadedPlugins) {
      if (typeof plugin.getSpec === 'function') {
        try {
          const spec = await plugin.getSpec();
          if (spec) {
            this.specRegistry.set(spec.id || pluginId, spec);
            this.log(`Loaded spec for plugin: ${pluginId}`, 'info');
          }
        } catch (error) {
          this.log(`Failed to load spec for plugin ${pluginId}: ${error.message}`, 'warning');
        }
      }
    }

    this.log(`Loaded ${this.specRegistry.size} specifications`, 'info');
  }

  /**
   * Execute aggregates for code generation
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Aggregate execution results
   */
  async _executeAggregates(context) {
    const results = {
      generated: [],
      errors: [],
      warnings: [],
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0
      }
    };

    // Execute plugins based on context
    for (const [pluginId, plugin] of this.loadedPlugins) {
      try {
        if (typeof plugin.execute === 'function') {
          const pluginResults = await plugin.execute(context);
          results.generated.push(...(pluginResults.generated || []));
          results.errors.push(...(pluginResults.errors || []));
          results.warnings.push(...(pluginResults.warnings || []));
          results.stats.pluginsExecuted++;
        }
      } catch (error) {
        results.errors.push(`Plugin ${pluginId} execution failed: ${error.message}`);
        if (this.options.strictMode) {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Register a component in the appropriate registry
   * @param {string} registryId - Registry identifier
   * @param {string} componentId - Component identifier
   * @param {Object} component - Component to register
   */
  register(registryId, componentId, component) {
    if (registryId === 'plugin') {
      this.pluginRegistry.set(componentId, component);
    } else {
      // Handle other registry types
      let registry = this.aggregateRegistry.get(registryId);
      if (!registry) {
        registry = new Map();
        this.aggregateRegistry.set(registryId, registry);
      }
      registry.set(componentId, component);
    }
  }

  /**
   * Get a component from registries
   * @param {string} registryId - Registry identifier
   * @param {string} componentId - Component identifier
   * @returns {Object|null} The component or null if not found
   */
  get(registryId, componentId) {
    if (registryId === 'plugin') {
      return this.pluginRegistry.get(componentId) || null;
    }

    const registry = this.aggregateRegistry.get(registryId);
    return registry ? registry.get(componentId) || null : null;
  }

  /**
   * List components in a registry
   * @param {string} registryId - Registry identifier
   * @returns {Array} Array of component IDs
   */
  list(registryId) {
    if (registryId === 'plugin') {
      return Array.from(this.pluginRegistry.keys());
    }

    const registry = this.aggregateRegistry.get(registryId);
    return registry ? Array.from(registry.keys()) : [];
  }

  /**
   * Get root aggregate (AppAggregate)
   * @returns {Object} Root aggregate
   */
  getRootAggregate() {
    return this.aggregateRegistry.get('AppAggregate');
  }

  /**
   * Drill down through aggregates
   * @param {Array<string>} path - Path through aggregates
   * @returns {Object|null} Target component or null
   */
  drillDown(path) {
    let current = this.getRootAggregate();

    for (const segment of path) {
      if (current && typeof current.getChild === 'function') {
        current = current.getChild(segment);
      } else {
        return null;
      }
    }

    return current;
  }

  /**
   * Log a message with appropriate formatting
   * @param {string} message - Message to log
   * @param {string} level - Log level
   */
  log(message, level = 'info') {
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
   * @throws {Error} If already initialized
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error('Codegen system already initialized');
    }
  }

  /**
   * Ensure system is initialized
   * @throws {Error} If not initialized
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Codegen system not initialized. Call initialize() first.');
    }
  }

  /**
   * Mark system as initialized
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Get system status
   * @returns {Object} System status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      plugins: {
        discovered: this.discoveredPlugins.size,
        loaded: this.loadedPlugins.size
      },
      registries: {
        plugins: this.pluginRegistry.size,
        aggregates: this.aggregateRegistry.size,
        specs: this.specRegistry.size
      },
      options: this.options
    };
  }
}

module.exports = BaseCodegen;
