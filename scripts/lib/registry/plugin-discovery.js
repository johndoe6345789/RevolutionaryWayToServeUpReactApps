/**
 * Plugin Discovery
 * Scans directories and discovers plugin folders with metadata
 */

const fs = require('fs');
const path = require('path');
const MetadataLoader = require('../metadata-loader');

class PluginDiscovery {
  constructor() {
    this.pluginDirectories = [
      path.join(__dirname, '../../plugins'),
      path.join(__dirname, '../../../plugins'),
      path.join(process.cwd(), 'plugins')
    ];
    this.discoveredPlugins = new Map();
    this.metadataLoader = new MetadataLoader();
  }

  /**
   * Discovers all plugin folders in configured directories
   * @param {boolean} forceRediscover - Force rediscovery even if already discovered
   * @returns {Array} - Array of plugin directory paths
   */
  async discoverPlugins(forceRediscover = false) {
    if (this.discoveredPlugins.size > 0 && !forceRediscover) {
      return Array.from(this.discoveredPlugins.keys());
    }

    this.discoveredPlugins.clear();
    const pluginDirs = [];

    for (const directory of this.pluginDirectories) {
      try {
        if (fs.existsSync(directory)) {
          const plugins = await this.scanDirectory(directory);
          pluginDirs.push(...plugins);
        }
      } catch (error) {
        console.warn(`Warning: Failed to scan plugin directory ${directory}: ${error.message}`);
      }
    }

    // Cache discovered plugins with metadata
    for (const pluginDir of pluginDirs) {
      try {
        const metadata = this.metadataLoader.loadMetadata(pluginDir);
        this.discoveredPlugins.set(pluginDir, {
          metadata,
          discoveredAt: new Date().toISOString(),
          directory: pluginDir
        });
      } catch (error) {
        console.warn(`Warning: Failed to load metadata for ${pluginDir}: ${error.message}`);
      }
    }

    return pluginDirs;
  }

  /**
   * Scans a directory for plugin folders
   * @param {string} directory - Directory to scan
   * @returns {Array} - Array of plugin directory paths
   */
  async scanDirectory(directory) {
    const pluginDirs = [];

    try {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const itemPath = path.join(directory, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && this.isPluginFolder(itemPath)) {
          pluginDirs.push(itemPath);
        } else if (stat.isDirectory()) {
          // Recursively scan subdirectories
          const subPlugins = await this.scanDirectory(itemPath);
          pluginDirs.push(...subPlugins);
        } else if (stat.isFile() && item.endsWith('.plugin.js')) {
          // Handle legacy single-file plugins
          console.warn(`Warning: Legacy plugin file found: ${item}. Consider migrating to folder structure.`);
        }
      }
    } catch (error) {
      console.warn(`Warning: Failed to scan directory ${directory}: ${error.message}`);
    }

    return pluginDirs;
  }

  /**
   * Checks if a directory is a valid plugin folder
   * @param {string} dirPath - Directory path to check
   * @returns {boolean} - True if valid plugin folder
   */
  isPluginFolder(dirPath) {
    const metadataPath = path.join(dirPath, 'plugin.json');
    const indexPath = path.join(dirPath, 'index.js');
    
    return fs.existsSync(metadataPath) && fs.existsSync(indexPath);
  }

  /**
   * Discovers legacy single-file plugins for migration
   * @returns {Array} - Array of legacy plugin file paths
   */
  discoverLegacyPlugins() {
    const legacyPlugins = [];

    for (const directory of this.pluginDirectories) {
      try {
        if (fs.existsSync(directory)) {
          const items = fs.readdirSync(directory);

          for (const item of items) {
            const itemPath = path.join(directory, item);
            const stat = fs.statSync(itemPath);

            if (stat.isFile() && item.endsWith('.plugin.js')) {
              legacyPlugins.push({
                file: itemPath,
                name: item.replace('.plugin.js', ''),
                directory: directory
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Failed to scan for legacy plugins in ${directory}: ${error.message}`);
      }
    }

    return legacyPlugins;
  }

  /**
   * Gets metadata for a specific plugin
   * @param {string} pluginDir - Plugin directory path
   * @returns {Object} - Plugin metadata
   */
  getPluginMetadata(pluginDir) {
    const discovered = this.discoveredPlugins.get(pluginDir);
    return discovered ? discovered.metadata : null;
  }

  /**
   * Gets all discovered plugins with their metadata
   * @returns {Array} - Array of plugin info objects
   */
  getAllPlugins() {
    return Array.from(this.discoveredPlugins.entries()).map(([dir, info]) => ({
      directory: dir,
      metadata: info.metadata,
      discoveredAt: info.discoveredAt
    }));
  }

  /**
   * Filters plugins by category
   * @param {string} category - Category to filter by
   * @returns {Array} - Filtered plugins
   */
  getPluginsByCategory(category) {
    return this.getAllPlugins().filter(plugin => 
      plugin.metadata.category === category
    );
  }

  /**
   * Filters plugins by language
   * @param {string} language - Language to filter by
   * @returns {Array} - Filtered plugins
   */
  getPluginsByLanguage(language) {
    return this.getAllPlugins().filter(plugin => 
      plugin.metadata.language === language
    );
  }

  /**
   * Searches plugins by name or description
   * @param {string} query - Search query
   * @returns {Array} - Matching plugins
   */
  searchPlugins(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllPlugins().filter(plugin => {
      const metadata = plugin.metadata;
      return metadata.name.toLowerCase().includes(lowerQuery) ||
             metadata.description.toLowerCase().includes(lowerQuery) ||
             (metadata.tags && metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    });
  }

  /**
   * Gets information about discovered plugins
   * @returns {Object} - Plugin discovery information
   */
  getDiscoveryInfo() {
    const plugins = this.getAllPlugins();
    const categories = [...new Set(plugins.map(p => p.metadata.category))];
    const languages = [...new Set(plugins.map(p => p.metadata.language).filter(Boolean))];

    return {
      totalPlugins: plugins.length,
      pluginDirectories: this.pluginDirectories,
      categories,
      languages,
      discoveredPlugins: plugins,
      legacyPlugins: this.discoverLegacyPlugins()
    };
  }

  /**
   * Validates all discovered plugins
   * @param {PluginValidator} validator - Plugin validator instance
   * @returns {Object} - Validation results for all plugins
   */
  validateAllPlugins(validator) {
    const results = {
      valid: [],
      invalid: [],
      total: 0
    };

    for (const [pluginDir, info] of this.discoveredPlugins) {
      results.total++;
      
      try {
        const validation = validator.validatePluginStructure(pluginDir);
        if (validation.valid) {
          results.valid.push({
            plugin: info.metadata.name,
            directory: pluginDir
          });
        } else {
          results.invalid.push({
            plugin: info.metadata.name,
            directory: pluginDir,
            errors: validation.errors
          });
        }
      } catch (error) {
        results.invalid.push({
          plugin: info.metadata.name,
          directory: pluginDir,
          errors: [error.message]
        });
      }
    }

    return results;
  }

  /**
   * Clears the discovery cache
   */
  clearCache() {
    this.discoveredPlugins.clear();
    this.metadataLoader.clearCache();
  }

  /**
   * Adds a new plugin directory to scan
   * @param {string} directory - Directory path to add
   */
  addPluginDirectory(directory) {
    if (!this.pluginDirectories.includes(directory)) {
      this.pluginDirectories.push(directory);
    }
  }

  /**
   * Removes a plugin directory from scanning
   * @param {string} directory - Directory path to remove
   */
  removePluginDirectory(directory) {
    const index = this.pluginDirectories.indexOf(directory);
    if (index > -1) {
      this.pluginDirectories.splice(index, 1);
    }
  }
}

module.exports = PluginDiscovery;
