/**
 * Plugin Registry
 * Manages plugin discovery, loading, and execution
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('./base-plugin');

class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.pluginsDirectory = path.join(__dirname, '..', 'plugins');
    this.discoveredFiles = [];
  }

  /**
   * Discovers all plugin files in the plugins directory
   * @param {boolean} forceReload - Force rediscovery even if already discovered
   */
  async discoverPlugins(forceReload = false) {
    if (this.discoveredFiles.length > 0 && !forceReload) {
      return;
    }

    this.plugins.clear();
    this.discoveredFiles = [];

    // Ensure plugins directory exists
    if (!fs.existsSync(this.pluginsDirectory)) {
      fs.mkdirSync(this.pluginsDirectory, { recursive: true });
      return;
    }

    // Scan for plugin files
    const files = fs.readdirSync(this.pluginsDirectory);
    
    for (const file of files) {
      if (file.endsWith('.plugin.js')) {
        const filePath = path.join(this.pluginsDirectory, file);
        this.discoveredFiles.push(filePath);
        
        try {
          await this.loadPluginFile(filePath);
        } catch (error) {
          console.warn(`Warning: Failed to load plugin from ${file}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Loads a plugin from a file
   * @param {string} filePath - Path to plugin file
   */
  async loadPluginFile(filePath) {
    try {
      // Clear require cache to allow reloading
      delete require.cache[require.resolve(filePath)];
      
      const PluginClass = require(filePath);
      
      // Check if it's a proper plugin class
      if (typeof PluginClass !== 'function') {
        throw new Error('Plugin file must export a class');
      }

      // Create plugin instance
      const plugin = new PluginClass();
      
      // Validate that it extends BasePlugin
      if (!(plugin instanceof BasePlugin)) {
        throw new Error('Plugin must extend BasePlugin');
      }

      // Set file path metadata
      plugin.file = path.relative(process.cwd(), filePath);
      
      // Register the plugin
      this.registerPlugin(plugin);
      
    } catch (error) {
      throw new Error(`Failed to load plugin from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Registers a plugin instance
   * @param {BasePlugin} plugin - Plugin instance to register
   */
  registerPlugin(plugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin with name '${plugin.name}' is already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Gets a plugin by name
   * @param {string} name - Plugin name
   * @returns {BasePlugin|null} - Plugin instance or null if not found
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Checks if a plugin is registered
   * @param {string} name - Plugin name
   * @returns {boolean} - True if plugin exists
   */
  hasPlugin(name) {
    return this.plugins.has(name);
  }

  /**
   * Gets all registered plugins
   * @returns {BasePlugin[]} - Array of plugin instances
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Gets plugins by category
   * @param {string} category - Category to filter by
   * @returns {BasePlugin[]} - Array of plugins in the category
   */
  getPluginsByCategory(category) {
    return this.getPlugins().filter(plugin => plugin.category === category);
  }

  /**
   * Gets the number of registered plugins
   * @returns {number} - Plugin count
   */
  getPluginCount() {
    return this.plugins.size;
  }

  /**
   * Loads a specific plugin (initializes it)
   * @param {BasePlugin|string} plugin - Plugin instance or name
   * @param {Object} context - Execution context
   */
  async loadPlugin(plugin, context = {}) {
    if (typeof plugin === 'string') {
      plugin = this.getPlugin(plugin);
    }
    
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.loaded) {
      return plugin;
    }

    // Validate dependencies
    if (!plugin.validateDependencies(this)) {
      const missingDeps = plugin.dependencies.filter(dep => !this.hasPlugin(dep));
      throw new Error(`Plugin '${plugin.name}' has missing dependencies: ${missingDeps.join(', ')}`);
    }

    // Load dependencies first
    for (const depName of plugin.dependencies) {
      const depPlugin = this.getPlugin(depName);
      if (!depPlugin.loaded) {
        await this.loadPlugin(depPlugin, context);
      }
    }

    // Initialize the plugin
    await plugin.initialize(context);
    
    return plugin;
  }

  /**
   * Unloads a plugin (calls cleanup and marks as unloaded)
   * @param {BasePlugin|string} plugin - Plugin instance or name
   */
  async unloadPlugin(plugin) {
    if (typeof plugin === 'string') {
      plugin = this.getPlugin(plugin);
    }
    
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (!plugin.loaded) {
      return;
    }

    await plugin.cleanup();
    plugin.loaded = false;
  }

  /**
   * Reloads a plugin (unload then load)
   * @param {BasePlugin|string} plugin - Plugin instance or name
   * @param {Object} context - Execution context
   */
  async reloadPlugin(plugin, context = {}) {
    if (typeof plugin === 'string') {
      plugin = this.getPlugin(plugin);
    }
    
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await this.unloadPlugin(plugin);
    await this.loadPlugin(plugin, context);
    
    return plugin;
  }

  /**
   * Executes a plugin
   * @param {BasePlugin|string} plugin - Plugin instance or name
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Plugin execution results
   */
  async executePlugin(plugin, context = {}) {
    plugin = await this.loadPlugin(plugin, context);
    
    try {
      const results = await plugin.execute(context);
      return results;
    } catch (error) {
      plugin.log(`Plugin execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Gets plugin statistics
   * @returns {Object} - Plugin statistics
   */
  getStatistics() {
    const plugins = this.getPlugins();
    const categories = {};
    
    for (const plugin of plugins) {
      if (!categories[plugin.category]) {
        categories[plugin.category] = 0;
      }
      categories[plugin.category]++;
    }

    return {
      total: plugins.length,
      loaded: plugins.filter(p => p.loaded).length,
      categories: categories,
      discovered: this.discoveredFiles.length
    };
  }

  /**
   * Validates all plugin dependencies
   * @returns {Object} - Validation results
   */
  validateDependencies() {
    const issues = [];
    
    for (const plugin of this.getPlugins()) {
      for (const dep of plugin.dependencies) {
        if (!this.hasPlugin(dep)) {
          issues.push({
            plugin: plugin.name,
            missingDependency: dep
          });
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Creates a dependency graph for plugins
   * @returns {Object} - Dependency graph
   */
  createDependencyGraph() {
    const graph = {};
    
    for (const plugin of this.getPlugins()) {
      graph[plugin.name] = {
        dependencies: plugin.dependencies,
        category: plugin.category,
        loaded: plugin.loaded
      };
    }

    return graph;
  }

  /**
   * Clears all plugins from the registry
   */
  clear() {
    this.plugins.clear();
    this.discoveredFiles = [];
  }
}

module.exports = PluginRegistry;
