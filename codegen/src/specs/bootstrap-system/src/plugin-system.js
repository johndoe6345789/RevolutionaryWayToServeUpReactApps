/**
 * PluginSystem - AGENTS.md compliant Plugin System
 *
 * Plugin discovery, loading, and management system
 *
 * This module provides core functionality
 * as part of the bootstrap system.
 *
 * @class PluginSystem
 * @extends BaseComponent
 */
const BaseComponent = require('../../../core/base-component');

class PluginSystem extends BaseComponent {
  constructor(spec) {
    super(spec);
    this._dependencies = spec.dependencies || {};
    this._initialized = false;
  }

  async initialise() {
    await super.initialise();
    if (!this._validateDependencies()) {
      throw new Error(`Missing required dependencies for ${this.spec.id}`);
    }
    this._initialized = true;
    return this;
  }

  async execute(context) {
    if (!this._initialized) {
      throw new Error('PluginSystem must be initialized before execution');
    }
    try {
      const result = await this._executeCore(context);
      return { success: true, result, timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async _executeCore(context) {
    return { message: 'PluginSystem executed successfully' };
  }

  validate(input) {
    return input && typeof input === 'object' && input.id && typeof input.id === 'string';
  }

  _validateDependencies() {
    const requiredDeps = ["bootstrap.module-loader"];
    return requiredDeps.every(dep => this._dependencies[dep]);
  }
/**
 * Discovers available plugins from configured directories
 * Scans plugin directories and validates plugin configurations
 *
 * @async
 * @param {Object} [options] - Discovery options
 * @param {Array<string>} [options.directories] - Directories to scan
 * @param {Array<string>} [options.patterns] - File patterns to match
 * @returns {Promise<Array<Object>>} Array of discovered plugin specifications
 */
async discoverPlugins(options = {}) {
  const directories = options.directories || this.spec.pluginDirectories || ['./plugins'];
  const patterns = options.patterns || ['plugin.json', 'spec.json'];

  const discoveredPlugins = [];

  for (const directory of directories) {
    try {
      const plugins = await this._scanDirectory(directory, patterns);
      discoveredPlugins.push(...plugins);
    } catch (error) {
      console.warn(`Warning: Failed to scan directory ${directory}: ${error.message}`);
    }
  }

  return discoveredPlugins;
}

/**
 * Loads a plugin by its specification
 * Initializes the plugin and registers it with the system
 *
 * @async
 * @param {Object} pluginSpec - Plugin specification
 * @param {Object} [context] - Loading context
 * @returns {Promise<Object>} Loaded plugin instance
 * @throws {Error} If plugin loading fails
 */
async loadPlugin(pluginSpec, context = {}) {
  if (!pluginSpec || !pluginSpec.id) {
    throw new Error('Invalid plugin specification provided');
  }

  try {
    const pluginModule = await this._loadPluginModule(pluginSpec);
    const pluginInstance = new pluginModule(pluginSpec);

    await pluginInstance.initialise();
    await this.registerPlugin(pluginInstance, context);

    return pluginInstance;
  } catch (error) {
    throw new Error(`Failed to load plugin ${pluginSpec.id}: ${error.message}`);
  }
}

/**
 * Registers a plugin with the system
 * Makes the plugin available for use and updates system state
 *
 * @async
 * @param {Object} plugin - Plugin instance to register
 * @param {Object} [context] - Registration context
 * @returns {Promise<void>}
 */
async registerPlugin(plugin, context = {}) {
  if (!plugin || !plugin.spec || !plugin.spec.id) {
    throw new Error('Invalid plugin instance provided');
  }

  const pluginId = plugin.spec.id;

  // Check for duplicate registration
  if (this._registeredPlugins[pluginId]) {
    throw new Error(`Plugin ${pluginId} is already registered`);
  }

  // Register the plugin
  this._registeredPlugins[pluginId] = plugin;

  // Execute plugin registration hook if available
  if (typeof plugin.onRegister === 'function') {
    await plugin.onRegister(context);
  }
}
}

module.exports = PluginSystem;