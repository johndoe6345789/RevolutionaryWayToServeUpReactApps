/**
 * Plugin Loader
 * Handles loading and instantiation of plugin modules from folder structure
 */

const path = require('path');
const BasePlugin = require('../base-plugin');
const ModuleLoader = require('../module-loader');
const MetadataLoader = require('../metadata-loader');

class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map();
    this.moduleLoader = new ModuleLoader();
    this.metadataLoader = new MetadataLoader();
  }

  /**
   * Loads a plugin from a directory path
   * @param {string} pluginDir - Path to plugin directory
   * @returns {BasePlugin} - Plugin instance
   */
  async loadPluginFile(pluginDir) {
    try {
      // Load metadata
      const metadata = this.metadataLoader.loadMetadata(pluginDir);
      
      // Load main plugin entry file
      const entryPath = metadata.resolvedEntry;
      
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(entryPath)];
      
      const PluginClass = require(entryPath);
      
      // Validate that it's a proper plugin class
      if (typeof PluginClass !== 'function') {
        throw new Error(`Plugin entry ${entryPath} must export a class`);
      }
      
      // Create plugin instance with metadata
      const plugin = new PluginClass(metadata);
      
      // Validate plugin structure
      if (!(plugin instanceof BasePlugin)) {
        throw new Error(`Plugin ${pluginDir} must extend BasePlugin`);
      }
      
      // Set directory and additional metadata
      plugin.directory = pluginDir;
      plugin.entry = entryPath;
      plugin.resolvedModules = metadata.resolvedModules || [];
      
      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${pluginDir}: ${error.message}`);
    }
  }

  /**
   * Loads a legacy single-file plugin (for migration)
   * @param {string} filePath - Path to legacy plugin file
   * @returns {BasePlugin} - Plugin instance
   */
  async loadLegacyPlugin(filePath) {
    try {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(filePath)];
      
      const PluginClass = require(filePath);
      
      // Validate that it's a proper plugin class
      if (typeof PluginClass !== 'function') {
        throw new Error(`Plugin file ${filePath} must export a class`);
      }
      
      // Create plugin instance
      const plugin = new PluginClass();
      
      // Validate plugin structure
      if (!(plugin instanceof BasePlugin)) {
        throw new Error(`Plugin ${filePath} must extend BasePlugin`);
      }
      
      // Set legacy flag and file path
      plugin.file = filePath;
      plugin.isLegacy = true;
      
      return plugin;
    } catch (error) {
      throw new Error(`Failed to load legacy plugin from ${filePath}: ${error.message}`);
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

    // Add module loader to context if plugin has modules
    if (plugin.resolvedModules && plugin.resolvedModules.length > 0) {
      context.moduleLoader = this.moduleLoader;
      plugin.modules = plugin.resolvedModules;
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
    
    if (plugin.directory) {
      const reloadedPlugin = await this.loadPluginFile(plugin.directory);
      return await this.initializePlugin(reloadedPlugin, context);
    }
    
    throw new Error('Cannot reload plugin: no directory path available');
  }
}

module.exports = PluginLoader;
