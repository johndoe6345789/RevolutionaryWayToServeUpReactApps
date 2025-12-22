const BaseClass = require('../base/base-class.js');
const PluginGroupData = require('../data/plugin-group-data.js');
const fs = require('fs');
const path = require('path');

/**
 * PluginGroupAggregate - Manages plugin groups and their relationships
 * Enforces OO plugin rules with single business method
 */
class PluginGroupAggregate extends BaseClass {
  /**
   * Creates a new PluginGroupAggregate instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.pluginGroups = new Map();
    this.groupMetadata = new Map();
    this.groupsPath = data.groupsPath || path.join(__dirname, '..', 'plugins', 'groups');
    this.enableValidation = data.enableValidation !== false;
    this.loadOrder = data.loadOrder || [];
  }

  /**
   * Initializes the plugin group aggregate and loads all groups
   * @returns {Promise<PluginGroupAggregate>} The initialized instance
   */
  async initialize() {
    await this.loadPluginGroups();
    await this.validateGroupRelationships();
    this.generateGetMethods();
    return super.initialize();
  }

  /**
   * The ONE additional method - loads plugin groups from JSON files
   * @returns {Promise<Array>} The loaded plugin groups
   */
  async loadPluginGroups() {
    try {
      const groups = [];
      
      // Ensure groups directory exists
      if (!fs.existsSync(this.groupsPath)) {
        fs.mkdirSync(this.groupsPath, { recursive: true });
        this.log(`Created plugin groups directory: ${this.groupsPath}`, 'info');
      }
      
      // Scan for group metadata files
      const files = fs.readdirSync(this.groupsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.groupsPath, file);
          const groupData = this.loadGroupFromFile(filePath);
          if (groupData) {
            groups.push(groupData);
          }
        }
      }
      
      // Create PluginGroupData instances and store them
      for (const groupConfig of groups) {
        const groupData = new PluginGroupData(groupConfig);
        await groupData.initialize();
        
        if (this.enableValidation) {
          groupData.validate();
        }
        
        this.pluginGroups.set(groupData.name, groupData);
        this.groupMetadata.set(groupData.name, {
          filePath: path.join(this.groupsPath, `${groupData.name}.json`),
          loadedAt: new Date().toISOString(),
          category: groupData.category
        });
      }
      
      this.log(`Loaded ${groups.length} plugin groups`, 'info');
      return groups;
    } catch (error) {
      throw new Error(`Failed to load plugin groups: ${error.message}`);
    }
  }

  /**
   * Loads a single group from file
   * @param {string} filePath - Path to group JSON file
   * @returns {Object|null} Group configuration or null if failed
   */
  loadGroupFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const groupConfig = JSON.parse(content);
      
      // Add file-based metadata
      groupConfig.filePath = filePath;
      groupConfig.fileName = path.basename(filePath, '.json');
      
      return groupConfig;
    } catch (error) {
      this.log(`Failed to load group from ${filePath}: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Validates group relationships and dependencies
   */
  async validateGroupRelationships() {
    if (!this.enableValidation) {
      return;
    }
    
    const issues = [];
    const allGroups = Array.from(this.pluginGroups.keys());
    
    for (const [groupName, groupData] of this.pluginGroups) {
      // Check dependencies
      for (const dependency of groupData.dependencies) {
        if (!this.pluginGroups.has(dependency)) {
          issues.push(`Group ${groupName} depends on unknown group: ${dependency}`);
        }
      }
      
      // Check plugin references
      for (const plugin of groupData.plugins) {
        if (plugin.dependencies) {
          for (const pluginDep of plugin.dependencies) {
            if (!allGroups.includes(pluginDep)) {
              issues.push(`Plugin ${plugin.name} in group ${groupName} depends on unknown group: ${pluginDep}`);
            }
          }
        }
      }
      
      // Validate load order
      const loadOrderValidation = groupData.validateLoadOrder();
      if (!loadOrderValidation.valid) {
        issues.push(...loadOrderValidation.issues.map(issue => `${groupName}: ${issue}`));
      }
    }
    
    if (issues.length > 0) {
      this.log(`Group relationship validation found ${issues.length} issues:`, 'warn');
      for (const issue of issues) {
        this.log(`  - ${issue}`, 'warn');
      }
    }
  }

  /**
   * Generates get methods for each plugin group
   */
  generateGetMethods() {
    for (const [groupName, groupData] of this.pluginGroups) {
      const methodName = `get${groupName}Group`;
      
      this[methodName] = async function(config = {}) {
        try {
          // Return a copy of the group data with configuration applied
          const groupConfig = groupData.getGroupConfig();
          return {
            ...groupConfig,
            ...config,
            plugins: groupData.getSortedPlugins(),
            stats: groupData.getGroupStats()
          };
        } catch (error) {
          throw new Error(`Failed to get ${groupName} group: ${error.message}`);
        }
      };
    }
  }

  /**
   * Gets plugin group information by name
   * @param {string} groupName - The group name to lookup
   * @returns {Object|null} Plugin group information or null if not found
   */
  getPluginGroupInfo(groupName) {
    const groupData = this.pluginGroups.get(groupName);
    return groupData ? groupData.getGroupConfig() : null;
  }

  /**
   * Gets all plugin groups
   * @returns {Array} Array of plugin group information
   */
  getAllPluginGroups() {
    return Array.from(this.pluginGroups.values()).map(group => group.getGroupConfig());
  }

  /**
   * Gets plugin groups by category
   * @param {string} category - Category to filter by
   * @returns {Array} Array of plugin groups in category
   */
  getPluginGroupsByCategory(category) {
    return Array.from(this.pluginGroups.values())
      .filter(group => group.category === category)
      .map(group => group.getGroupConfig());
  }

  /**
   * Gets plugins from all groups
   * @returns {Array} Array of all plugins across all groups
   */
  getAllPlugins() {
    const allPlugins = [];
    
    for (const groupData of this.pluginGroups.values()) {
      const groupPlugins = groupData.getSortedPlugins();
      allPlugins.push(...groupPlugins.map(plugin => ({
        ...plugin,
        groupName: groupData.name,
        groupCategory: groupData.category
      })));
    }
    
    return allPlugins;
  }

  /**
   * Gets enabled plugins from all groups
   * @returns {Array} Array of enabled plugins
   */
  getEnabledPlugins() {
    const enabledPlugins = [];
    
    for (const groupData of this.pluginGroups.values()) {
      if (groupData.enabled) {
        const groupPlugins = groupData.getEnabledPlugins();
        enabledPlugins.push(...groupPlugins.map(plugin => ({
          ...plugin,
          groupName: groupData.name,
          groupCategory: groupData.category
        })));
      }
    }
    
    return enabledPlugins;
  }

  /**
   * Checks if a plugin group exists
   * @param {string} groupName - The group name to check
   * @returns {boolean} True if group exists
   */
  hasPluginGroup(groupName) {
    return this.pluginGroups.has(groupName);
  }

  /**
   * Adds a new plugin group
   * @param {Object} groupConfig - Group configuration
   * @returns {Promise<boolean>} True if group was added
   */
  async addPluginGroup(groupConfig) {
    try {
      const groupData = new PluginGroupData(groupConfig);
      await groupData.initialize();
      
      if (this.enableValidation) {
        groupData.validate();
      }
      
      // Save to file
      const filePath = path.join(this.groupsPath, `${groupData.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(groupConfig, null, 2), 'utf8');
      
      // Add to memory
      this.pluginGroups.set(groupData.name, groupData);
      this.groupMetadata.set(groupData.name, {
        filePath: filePath,
        loadedAt: new Date().toISOString(),
        category: groupData.category
      });
      
      // Regenerate get methods
      this.generateGetMethods();
      
      this.log(`Added plugin group: ${groupData.name}`, 'info');
      return true;
    } catch (error) {
      this.log(`Failed to add plugin group: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Removes a plugin group
   * @param {string} groupName - Group name to remove
   * @returns {Promise<boolean>} True if group was removed
   */
  async removePluginGroup(groupName) {
    try {
      const groupData = this.pluginGroups.get(groupName);
      if (!groupData) {
        return false;
      }
      
      // Remove file
      const metadata = this.groupMetadata.get(groupName);
      if (metadata && metadata.filePath && fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
      }
      
      // Remove from memory
      this.pluginGroups.delete(groupName);
      this.groupMetadata.delete(groupName);
      
      // Regenerate get methods
      this.generateGetMethods();
      
      this.log(`Removed plugin group: ${groupName}`, 'info');
      return true;
    } catch (error) {
      this.log(`Failed to remove plugin group: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Updates a plugin group
   * @param {string} groupName - Group name to update
   * @param {Object} updates - Updates to apply
   * @returns {Promise<boolean>} True if group was updated
   */
  async updatePluginGroup(groupName, updates) {
    try {
      const groupData = this.pluginGroups.get(groupName);
      if (!groupData) {
        return false;
      }
      
      // Apply updates to group data
      Object.assign(groupData, updates);
      
      // Revalidate if enabled
      if (this.enableValidation) {
        groupData.validate();
      }
      
      // Save to file
      const metadata = this.groupMetadata.get(groupName);
      if (metadata && metadata.filePath) {
        const groupConfig = groupData.getGroupConfig();
        fs.writeFileSync(metadata.filePath, JSON.stringify(groupConfig, null, 2), 'utf8');
      }
      
      // Update metadata
      this.groupMetadata.set(groupName, {
        ...metadata,
        updatedAt: new Date().toISOString()
      });
      
      this.log(`Updated plugin group: ${groupName}`, 'info');
      return true;
    } catch (error) {
      this.log(`Failed to update plugin group: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Gets group statistics
   * @returns {Object} Comprehensive group statistics
   */
  getGroupStatistics() {
    const stats = {
      totalGroups: this.pluginGroups.size,
      enabledGroups: 0,
      totalPlugins: 0,
      enabledPlugins: 0,
      categories: {},
      groups: []
    };
    
    for (const [groupName, groupData] of this.pluginGroups) {
      const groupStats = groupData.getGroupStats();
      
      stats.groups.push(groupStats);
      
      if (groupData.enabled) {
        stats.enabledGroups++;
      }
      
      stats.totalPlugins += groupStats.pluginCount;
      
      // Count enabled plugins in this group
      const enabledInGroup = groupData.getEnabledPlugins().length;
      stats.enabledPlugins += enabledInGroup;
      
      // Track categories
      if (!stats.categories[groupData.category]) {
        stats.categories[groupData.category] = 0;
      }
      stats.categories[groupData.category]++;
    }
    
    return stats;
  }

  /**
   * Gets group dependencies graph
   * @returns {Object} Dependency graph
   */
  getDependencyGraph() {
    const graph = {};
    
    for (const [groupName, groupData] of this.pluginGroups) {
      graph[groupName] = {
        dependencies: [...groupData.dependencies],
        dependents: [],
        category: groupData.category,
        enabled: groupData.enabled
      };
    }
    
    // Find dependents
    for (const [groupName, groupData] of this.pluginGroups) {
      for (const dependency of groupData.dependencies) {
        if (graph[dependency]) {
          graph[dependency].dependents.push(groupName);
        }
      }
    }
    
    return graph;
  }

  /**
   * Validates entire plugin group system
   * @returns {Object} Validation results
   */
  validateSystem() {
    const issues = [];
    const warnings = [];
    
    // Check for circular dependencies
    const visited = new Set();
    const recursionStack = new Set();
    
    const checkCircular = (groupName, path = []) => {
      if (recursionStack.has(groupName)) {
        const cycle = path.slice(path.indexOf(groupName)).concat(groupName);
        issues.push(`Circular dependency detected: ${cycle.join(' -> ')}`);
        return;
      }
      
      if (visited.has(groupName)) {
        return;
      }
      
      visited.add(groupName);
      recursionStack.add(groupName);
      
      const groupData = this.pluginGroups.get(groupName);
      if (groupData) {
        for (const dependency of groupData.dependencies) {
          checkCircular(dependency, [...path, groupName]);
        }
      }
      
      recursionStack.delete(groupName);
    };
    
    for (const groupName of this.pluginGroups.keys()) {
      checkCircular(groupName);
    }
    
    // Check for orphaned plugins
    const allPluginNames = new Set();
    for (const groupData of this.pluginGroups.values()) {
      for (const plugin of groupData.plugins) {
        allPluginNames.add(plugin.name);
      }
    }
    
    // Check for empty groups
    for (const [groupName, groupData] of this.pluginGroups) {
      if (groupData.plugins.length === 0) {
        warnings.push(`Group ${groupName} has no plugins`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      warnings: warnings,
      totalGroups: this.pluginGroups.size,
      totalPlugins: allPluginNames.size
    };
  }
}

module.exports = PluginGroupAggregate;
