/**
 * Plugin Registry
 * Manages plugin discovery, loading, and execution
 */

const PluginDiscovery = require('./plugin-discovery');
const PluginLoader = require('./plugin-loader');

class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.discovery = new PluginDiscovery();
    this.loader = new PluginLoader();
    this.discoveredFiles = [];
  }

  /**
   * Discovers all plugin folders and loads them
   * @param {boolean} forceReload - Force rediscovery even if already discovered
   */
  async discoverPlugins(forceReload = false) {
    if (this.discoveredFiles.length > 0 && !forceReload) {
      return;
    }

    this.plugins.clear();
    this.discoveredFiles = [];

    // Discover plugin directories
    const discoveredDirs = await this.discovery.discoverPlugins(forceReload);
    this.discoveredFiles = discoveredDirs;

    // Load discovered plugins
    for (const pluginDir of discoveredDirs) {
      try {
        await this.loadPluginFile(pluginDir);
      } catch (error) {
        console.warn(`Warning: Failed to load plugin from ${pluginDir}: ${error.message}`);
      }
    }
  }

  /**
   * Loads a plugin from a file
   * @param {string} filePath - Path to plugin file
   */
  async loadPluginFile(filePath) {
    const plugin = await this.loader.loadPluginFile(filePath);
    this.registerPlugin(plugin);
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
   * Gets plugins by language
   * @param {string} languageName - Name of the language
   * @returns {BasePlugin[]} - Array of plugins for the language
   */
  getPluginsByLanguage(languageName) {
    return this.getPlugins().filter(plugin => plugin.language === languageName);
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

    // Validate dependencies
    const missingDeps = this.loader.getMissingDependencies(plugin, this);
    if (missingDeps.length > 0) {
      throw new Error(`Plugin '${plugin.name}' has missing dependencies: ${missingDeps.join(', ')}`);
    }

    // Load dependencies first
    for (const depName of plugin.dependencies || []) {
      const depPlugin = this.getPlugin(depName);
      if (!depPlugin.loaded) {
        await this.loadPlugin(depPlugin, context);
      }
    }

    return await this.loader.initializePlugin(plugin, context);
  }

  /**
   * Unloads a plugin
   * @param {BasePlugin|string} plugin - Plugin instance or name
   */
  async unloadPlugin(plugin) {
    if (typeof plugin === 'string') {
      plugin = this.getPlugin(plugin);
    }
    
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await this.loader.unloadPlugin(plugin);
  }

  /**
   * Reloads a plugin
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

    const reloadedPlugin = await this.loader.reloadPlugin(plugin, context);
    
    // Update registry with reloaded plugin
    this.plugins.set(reloadedPlugin.name, reloadedPlugin);
    
    return reloadedPlugin;
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
   * Loads language-specific plugins for a given language
   * @param {string} languageName - Name of the language
   * @param {Object} context - Execution context
   */
  async loadLanguagePlugins(languageName, context = {}) {
    const languagePlugins = this.getPluginsByLanguage(languageName);
    const loadedPlugins = [];

    for (const plugin of languagePlugins) {
      if (!plugin.loaded) {
        try {
          await this.loadPlugin(plugin, context);
          console.log(`Loaded ${plugin.name} for ${languageName}`);
          loadedPlugins.push(plugin);
        } catch (error) {
          console.warn(`Warning: Failed to load ${plugin.name} for ${languageName}: ${error.message}`);
        }
      }
    }

    return loadedPlugins;
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
