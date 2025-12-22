const BaseData = require('./base-data.js');

/**
 * PluginGroupData - Data class for plugin group configurations
 * Enforces OO plugin rules with single business method
 */
class PluginGroupData extends BaseData {
  /**
   * Creates a new PluginGroupData instance
   * @param {Object} data - Plugin group configuration data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.plugins = data.plugins || [];
    this.config = data.config || {};
    this.dependencies = data.dependencies || [];
    this.enabled = data.enabled !== false;
    this.loadOrder = data.loadOrder || [];
  }

  /**
   * Initializes the plugin group data
   * @returns {Promise<PluginGroupData>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - plugin group-specific validation
   * @returns {boolean} True if plugin group data is valid
   * @throws {Error} If plugin group data is invalid
   */
  validate() {
    super.validate();
    
    if (!this.name) {
      throw new Error('Plugin group name is required');
    }
    
    if (!this.description) {
      throw new Error('Plugin group description is required');
    }
    
    if (!this.category) {
      throw new Error('Plugin group category is required');
    }
    
    if (!Array.isArray(this.plugins)) {
      throw new Error('Plugins must be an array');
    }
    
    if (!Array.isArray(this.dependencies)) {
      throw new Error('Dependencies must be an array');
    }
    
    if (!Array.isArray(this.loadOrder)) {
      throw new Error('Load order must be an array');
    }
    
    if (typeof this.config !== 'object') {
      throw new Error('Config must be an object');
    }
    
    // Validate plugin references
    for (const plugin of this.plugins) {
      if (!plugin.name || !plugin.version) {
        throw new Error('Each plugin must have name and version');
      }
    }
    
    // Validate load order references
    for (const pluginName of this.loadOrder) {
      if (!this.plugins.some(p => p.name === pluginName)) {
        throw new Error(`Load order references unknown plugin: ${pluginName}`);
      }
    }
    
    return true;
  }

  /**
   * Gets plugin by name
   * @param {string} pluginName - Plugin name to find
   * @returns {Object|null} Plugin information or null
   */
  getPlugin(pluginName) {
    return this.plugins.find(plugin => plugin.name === pluginName) || null;
  }

  /**
   * Adds a plugin to the group
   * @param {Object} plugin - Plugin information
   */
  addPlugin(plugin) {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version');
    }
    
    // Check if plugin already exists
    if (this.getPlugin(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already exists in group`);
    }
    
    this.plugins.push(plugin);
    
    // Add to load order if not present
    if (!this.loadOrder.includes(plugin.name)) {
      this.loadOrder.push(plugin.name);
    }
  }

  /**
   * Removes a plugin from the group
   * @param {string} pluginName - Plugin name to remove
   * @returns {boolean} True if plugin was removed
   */
  removePlugin(pluginName) {
    const initialLength = this.plugins.length;
    
    // Remove from plugins array
    this.plugins = this.plugins.filter(plugin => plugin.name !== pluginName);
    
    // Remove from load order
    this.loadOrder = this.loadOrder.filter(name => name !== pluginName);
    
    return this.plugins.length < initialLength;
  }

  /**
   * Checks if plugin exists in group
   * @param {string} pluginName - Plugin name to check
   * @returns {boolean} True if plugin exists
   */
  hasPlugin(pluginName) {
    return this.getPlugin(pluginName) !== null;
  }

  /**
   * Gets all plugin names
   * @returns {Array} Array of plugin names
   */
  getPluginNames() {
    return this.plugins.map(plugin => plugin.name);
  }

  /**
   * Gets plugins sorted by load order
   * @returns {Array} Sorted plugins array
   */
  getSortedPlugins() {
    const sorted = [];
    const pluginMap = new Map(this.plugins.map(p => [p.name, p]));
    
    // Add plugins in load order
    for (const pluginName of this.loadOrder) {
      const plugin = pluginMap.get(pluginName);
      if (plugin) {
        sorted.push(plugin);
        pluginMap.delete(pluginName);
      }
    }
    
    // Add any remaining plugins
    for (const plugin of pluginMap.values()) {
      sorted.push(plugin);
    }
    
    return sorted;
  }

  /**
   * Gets group dependencies recursively
   * @returns {Array} Array of all dependencies
   */
  getAllDependencies() {
    const allDeps = new Set();
    const processDeps = (deps) => {
      for (const dep of deps) {
        if (!allDeps.has(dep)) {
          allDeps.add(dep);
          // In a real implementation, you might resolve transitive dependencies here
        }
      }
    };
    
    processDeps(this.dependencies);
    
    // Add plugin dependencies
    for (const plugin of this.plugins) {
      if (plugin.dependencies) {
        processDeps(plugin.dependencies);
      }
    }
    
    return Array.from(allDeps);
  }

  /**
   * Gets group statistics
   * @returns {Object} Group statistics
   */
  getGroupStats() {
    return {
      name: this.name,
      category: this.category,
      pluginCount: this.plugins.length,
      dependencyCount: this.dependencies.length,
      enabled: this.enabled,
      hasLoadOrder: this.loadOrder.length > 0,
      plugins: this.plugins.map(p => ({
        name: p.name,
        version: p.version,
        enabled: p.enabled !== false
      }))
    };
  }

  /**
   * Updates plugin configuration
   * @param {string} pluginName - Plugin name
   * @param {Object} newConfig - New configuration
   */
  updatePluginConfig(pluginName, newConfig) {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found in group`);
    }
    
    plugin.config = { ...plugin.config, ...newConfig };
  }

  /**
   * Enables/disables a plugin
   * @param {string} pluginName - Plugin name
   * @param {boolean} enabled - Enable state
   */
  setPluginEnabled(pluginName, enabled) {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found in group`);
    }
    
    plugin.enabled = enabled !== false;
  }

  /**
   * Gets enabled plugins only
   * @returns {Array} Array of enabled plugins
   */
  getEnabledPlugins() {
    return this.plugins.filter(plugin => plugin.enabled !== false);
  }

  /**
   * Gets group configuration
   * @returns {Object} Group configuration
   */
  getGroupConfig() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      enabled: this.enabled,
      config: this.config,
      dependencies: this.dependencies,
      loadOrder: this.loadOrder,
      plugins: this.plugins,
      stats: this.getGroupStats()
    };
  }

  /**
   * Validates load order consistency
   * @returns {Object} Validation result
   */
  validateLoadOrder() {
    const issues = [];
    const pluginNames = this.getPluginNames();
    
    // Check for missing plugins in load order
    for (const pluginName of pluginNames) {
      if (!this.loadOrder.includes(pluginName)) {
        issues.push(`Plugin ${pluginName} not in load order`);
      }
    }
    
    // Check for unknown plugins in load order
    for (const loadOrderPlugin of this.loadOrder) {
      if (!pluginNames.includes(loadOrderPlugin)) {
        issues.push(`Load order references unknown plugin: ${loadOrderPlugin}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

module.exports = PluginGroupData;
