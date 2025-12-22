/**
 * Plugin Loader
 * Handles loading and initialization of plugins
 */

const path = require('path');
const BasePlugin = require('../base-plugin');

class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map();
  }

  /**
   * Loads a plugin from a file
   * @param {string} filePath - Path to plugin file
   * @returns {Promise<BasePlugin>} - Loaded plugin instance
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
      
      return plugin;
      
    } catch (error) {
      throw new Error(`Failed to load plugin from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Initializes a plugin with given context
   * @param {BasePlugin} plugin - Plugin to initialize
   * @param {Object} context - Initialization context
   * @returns {Promise<BasePlugin>} - Initialized plugin
   */
  async initializePlugin(plugin, context = {}) {
    if (!plugin) {
      throw new Error('Plugin is required');
    }

    if (plugin.loaded) {
      return plugin;
    }

    await plugin.initialize(context);
    plugin.loaded = true;
    
    return plugin;
  }

  /**
   * Validates plugin dependencies
   * @param {BasePlugin} plugin - Plugin to validate
   * @param {Object} pluginRegistry - Plugin registry to check dependencies
   * @returns {boolean} - True if dependencies are satisfied
   */
  validateDependencies(plugin, pluginRegistry) {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return true;
    }

    for (const dep of plugin.dependencies) {
      if (!pluginRegistry.hasPlugin(dep)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets missing dependencies for a plugin
   * @param {BasePlugin} plugin - Plugin to check
   * @param {Object} pluginRegistry - Plugin registry
   * @returns {Array<string>} - Array of missing dependencies
   */
  getMissingDependencies(plugin, pluginRegistry) {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return [];
    }

    const missing = [];
    for (const dep of plugin.dependencies) {
      if (!pluginRegistry.hasPlugin(dep)) {
        missing.push(dep);
      }
    }

    return missing;
  }

  /**
   * Unloads a plugin (calls cleanup and marks as unloaded)
   * @param {BasePlugin} plugin - Plugin to unload
   * @returns {Promise<void>}
   */
  async unloadPlugin(plugin) {
    if (!plugin || !plugin.loaded) {
      return;
    }

    try {
      await plugin.cleanup();
      plugin.loaded = false;
    } catch (error) {
      console.warn(`Warning: Failed to cleanup plugin ${plugin.name}: ${error.message}`);
    }
  }

  /**
   * Reloads a plugin (unload then load)
   * @param {BasePlugin} plugin - Plugin to reload
   * @param {Object} context - Execution context
   * @returns {Promise<BasePlugin>} - Reloaded plugin
   */
  async reloadPlugin(plugin, context = {}) {
    if (!plugin) {
      throw new Error('Plugin is required');
    }

    await this.unloadPlugin(plugin);
    
    if (plugin.file) {
      const reloadedPlugin = await this.loadPluginFile(plugin.file);
      return await this.initializePlugin(reloadedPlugin, context);
    }

    throw new Error('Cannot reload plugin: no file path available');
  }
}

module.exports = PluginLoader;
