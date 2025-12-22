/**
 * Configuration Manager
 * Handles global and plugin-specific configuration
 */

const GlobalConfig = require('./global-config');

class ConfigManager {
  constructor() {
    this.globalConfig = new GlobalConfig();
    const path = require('path');
    this.pluginConfigDir = path.join(__dirname, '..', '..', 'config', 'plugins');
    this.languageConfigDir = path.join(__dirname, '..', '..', 'config', 'languages');
    
    this.ensureConfigDirectories();
  }

  /**
   * Ensures configuration directories exist
   */
  ensureConfigDirectories() {
    const fs = require('fs');
    
    if (!fs.existsSync(this.pluginConfigDir)) {
      fs.mkdirSync(this.pluginConfigDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.languageConfigDir)) {
      fs.mkdirSync(this.languageConfigDir, { recursive: true });
    }
  }

  /**
   * Gets global configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} - Configuration value
   */
  getConfig(key, defaultValue = undefined) {
    return this.globalConfig.getConfig(key, defaultValue);
  }

  /**
   * Sets global configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} value - Value to set
   */
  setConfig(key, value) {
    this.globalConfig.setConfig(key, value);
  }

  /**
   * Deletes a configuration key
   * @param {string} key - Configuration key (supports dot notation)
   * @returns {boolean} - True if key was deleted
   */
  deleteConfig(key) {
    return this.globalConfig.deleteConfig(key);
  }

  /**
   * Resets global configuration to defaults
   */
  resetConfig() {
    this.globalConfig.resetConfig();
  }

  /**
   * Shows current configuration
   */
  showConfig() {
    this.globalConfig.showConfig();
  }

  /**
   * Gets plugin-specific configuration
   * @param {string} pluginName - Plugin name
   * @returns {Object} - Plugin configuration
   */
  getPluginConfig(pluginName) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(this.pluginConfigDir, `${pluginName}.json`);
    
    try {
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8');
        return JSON.parse(content);
      } else {
        const defaultConfig = this.getDefaultPluginConfig(pluginName);
        this.savePluginConfig(pluginName, defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.warn(`Warning: Failed to load plugin config for ${pluginName}: ${error.message}`);
      return this.getDefaultPluginConfig(pluginName);
    }
  }

  /**
   * Gets default plugin configuration
   * @param {string} pluginName - Plugin name
   * @returns {Object} - Default plugin configuration
   */
  getDefaultPluginConfig(pluginName) {
    return {
      name: pluginName,
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      enabled: true,
      settings: {},
      dependencies: []
    };
  }

  /**
   * Saves plugin-specific configuration
   * @param {string} pluginName - Plugin name
   * @param {Object} config - Plugin configuration
   */
  savePluginConfig(pluginName, config) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(this.pluginConfigDir, `${pluginName}.json`);
    
    try {
      config.updated = new Date().toISOString();
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to save plugin config for ${pluginName}: ${error.message}`);
    }
  }

  /**
   * Gets language-specific configuration
   * @param {string} languageName - Language name
   * @returns {Object} - Language configuration
   */
  getLanguageConfig(languageName) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(this.languageConfigDir, `${languageName}.json`);
    
    try {
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8');
        return JSON.parse(content);
      } else {
        const defaultConfig = this.getDefaultLanguageConfig(languageName);
        this.saveLanguageConfig(languageName, defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.warn(`Warning: Failed to load language config for ${languageName}: ${error.message}`);
      return this.getDefaultLanguageConfig(languageName);
    }
  }

  /**
   * Gets default language configuration
   * @param {string} languageName - Language name
   * @returns {Object} - Default language configuration
   */
  getDefaultLanguageConfig(languageName) {
    return {
      name: languageName,
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      enabled: true,
      priority: 50,
      fileExtensions: [],
      projectFiles: [],
      buildSystems: [],
      settings: {
        autoDetect: true,
        strictMode: false,
        outputFormat: 'json'
      }
    };
  }

  /**
   * Saves language-specific configuration
   * @param {string} languageName - Language name
   * @param {Object} config - Language configuration
   */
  saveLanguageConfig(languageName, config) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(this.languageConfigDir, `${languageName}.json`);
    
    try {
      config.updated = new Date().toISOString();
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to save language config for ${languageName}: ${error.message}`);
    }
  }

  /**
   * Merges configuration with command line options
   * @param {Object} options - Command line options
   * @returns {Object} - Merged configuration
   */
  mergeWithCliOptions(options = {}) {
    const merged = JSON.parse(JSON.stringify(this.globalConfig.config));
    
    // Override with CLI options
    if (options.debug !== undefined) {
      merged.settings.debug = options.debug;
    }
    
    if (options.verbose !== undefined) {
      merged.settings.verbose = options.verbose;
    }
    
    if (options.colors !== undefined) {
      merged.settings.colors = options.colors;
    }
    
    if (options['bootstrap-path']) {
      merged.settings.bootstrapPath = options['bootstrap-path'];
    }
    
    if (options['output-dir']) {
      merged.settings.outputDirectory = options['output-dir'];
    }
    
    if (options['reports-dir']) {
      merged.settings.reportsDirectory = options['reports-dir'];
    }
    
    // Add language-specific options
    if (options.language) {
      merged.settings.defaultLanguage = options.language;
    }
    
    if (options['language-priority']) {
      merged.settings.languagePriority = options['language-priority'];
    }
    
    return merged;
  }
}

module.exports = ConfigManager;
