/**
 * Plugin Discovery
 * Handles discovery of plugin files from the filesystem
 */

const fs = require('fs');
const path = require('path');

class PluginDiscovery {
  constructor() {
    this.pluginsDirectory = path.join(__dirname, '..', '..', 'plugins');
  }

  /**
   * Discovers all plugin files in the plugins directory
   * @param {boolean} forceReload - Force rediscovery even if already discovered
   * @returns {Promise<Array>} - Array of plugin file paths
   */
  async discoverPlugins(forceReload = false) {
    const discoveredFiles = [];

    // Ensure plugins directory exists
    if (!fs.existsSync(this.pluginsDirectory)) {
      fs.mkdirSync(this.pluginsDirectory, { recursive: true });
      return discoveredFiles;
    }

    // Scan for regular plugin files
    const regularFiles = await this.discoverRegularPlugins();
    discoveredFiles.push(...regularFiles);
    
    // Scan for language plugins
    const languageFiles = await this.discoverLanguagePlugins();
    discoveredFiles.push(...languageFiles);
    
    return discoveredFiles;
  }

  /**
   * Discovers regular plugin files
   * @returns {Promise<Array>} - Array of regular plugin file paths
   */
  async discoverRegularPlugins() {
    const files = fs.readdirSync(this.pluginsDirectory);
    const pluginFiles = [];
    
    for (const file of files) {
      if (file.endsWith('.plugin.js')) {
        const filePath = path.join(this.pluginsDirectory, file);
        pluginFiles.push(filePath);
      }
    }
    
    return pluginFiles;
  }

  /**
   * Discovers language plugins from language_plugins directory
   * @returns {Promise<Array>} - Array of language plugin file paths
   */
  async discoverLanguagePlugins() {
    const languagePluginsDir = path.join(this.pluginsDirectory, 'language_plugins');
    const pluginFiles = [];
    
    if (!fs.existsSync(languagePluginsDir)) {
      return pluginFiles;
    }

    const languageDirs = fs.readdirSync(languagePluginsDir);
    
    for (const langDir of languageDirs) {
      const langPath = path.join(languagePluginsDir, langDir);
      
      if (fs.statSync(langPath).isDirectory()) {
        const langFiles = await this.discoverLanguagePluginFiles(langDir, langPath);
        pluginFiles.push(...langFiles);
      }
    }
    
    return pluginFiles;
  }

  /**
   * Discovers plugin files in a specific language directory
   * @param {string} languageName - Name of the language
   * @param {string} languagePath - Path to the language directory
   * @returns {Promise<Array>} - Array of plugin file paths
   */
  async discoverLanguagePluginFiles(languageName, languagePath) {
    const pluginFiles = [];
    
    try {
      const files = fs.readdirSync(languagePath)
        .filter(file => file.endsWith('.plugin.js') || file.endsWith('.language.js'));

      for (const pluginFile of files) {
        const filePath = path.join(languagePath, pluginFile);
        pluginFiles.push(filePath);
      }
    } catch (error) {
      console.warn(`Warning: Failed to scan language directory ${languageName}: ${error.message}`);
    }
    
    return pluginFiles;
  }
}

module.exports = PluginDiscovery;
