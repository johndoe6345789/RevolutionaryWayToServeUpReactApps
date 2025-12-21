/**
 * Configuration Manager
 * Handles global and plugin-specific configuration
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.configDir = path.join(__dirname, '..', 'config');
    this.globalConfigFile = path.join(this.configDir, 'global.json');
    this.pluginConfigDir = path.join(this.configDir, 'plugins');
    this.config = {};
    
    this.ensureConfigDirectories();
    this.loadGlobalConfig();
  }

  /**
   * Ensures configuration directories exist
   */
  ensureConfigDirectories() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.pluginConfigDir)) {
      fs.mkdirSync(this.pluginConfigDir, { recursive: true });
    }
  }

  /**
   * Loads global configuration
   */
  loadGlobalConfig() {
    try {
      if (fs.existsSync(this.globalConfigFile)) {
        const content = fs.readFileSync(this.globalConfigFile, 'utf8');
        this.config = JSON.parse(content);
      } else {
        this.config = this.getDefaultGlobalConfig();
        this.saveGlobalConfig();
      }
    } catch (error) {
      console.warn(`Warning: Failed to load global config: ${error.message}`);
      this.config = this.getDefaultGlobalConfig();
    }
  }

  /**
   * Gets default global configuration
   * @returns {Object} - Default configuration
   */
  getDefaultGlobalConfig() {
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      settings: {
        debug: false,
        verbose: false,
        colors: true,
        bootstrapPath: path.join(__dirname, '..', '..'),
        outputDirectory: path.join(__dirname, '..', 'output'),
        reportsDirectory: path.join(__dirname, '..', 'reports')
      },
      plugins: {
        autoLoad: true,
        autoReload: false,
        timeout: 30000 // 30 seconds
      }
    };
  }

  /**
   * Saves global configuration
   */
  saveGlobalConfig() {
    try {
      this.config.updated = new Date().toISOString();
      fs.writeFileSync(this.globalConfigFile, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to save global config: ${error.message}`);
    }
  }

  /**
   * Gets global configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} - Configuration value
   */
  getConfig(key, defaultValue = undefined) {
    if (!key) {
      return this.config;
    }

    const keys = key.split('.');
    let current = this.config;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Sets global configuration value
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} value - Value to set
   */
  setConfig(key, value) {
    const keys = key.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.saveGlobalConfig();
  }

  /**
   * Deletes a configuration key
   * @param {string} key - Configuration key (supports dot notation)
   */
  deleteConfig(key) {
    const keys = key.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        return false; // Key doesn't exist
      }
      current = current[k];
    }

    const lastKey = keys[keys.length - 1];
    if (current.hasOwnProperty(lastKey)) {
      delete current[lastKey];
      this.saveGlobalConfig();
      return true;
    }

    return false;
  }

  /**
   * Resets global configuration to defaults
   */
  resetConfig() {
    this.config = this.getDefaultGlobalConfig();
    this.saveGlobalConfig();
  }

  /**
   * Gets plugin-specific configuration
   * @param {string} pluginName - Plugin name
   * @returns {Object} - Plugin configuration
   */
  getPluginConfig(pluginName) {
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
    const configFile = path.join(this.pluginConfigDir, `${pluginName}.json`);
    
    try {
      config.updated = new Date().toISOString();
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Failed to save plugin config for ${pluginName}: ${error.message}`);
    }
  }

  /**
   * Sets plugin configuration value
   * @param {string} pluginName - Plugin name
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} value - Value to set
   */
  setPluginConfig(pluginName, key, value) {
    const config = this.getPluginConfig(pluginName);
    
    const keys = key.split('.');
    let current = config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.savePluginConfig(pluginName, config);
  }

  /**
   * Deletes plugin configuration
   * @param {string} pluginName - Plugin name
   */
  deletePluginConfig(pluginName) {
    const configFile = path.join(this.pluginConfigDir, `${pluginName}.json`);
    
    try {
      if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile);
        return true;
      }
    } catch (error) {
      console.warn(`Warning: Failed to delete plugin config for ${pluginName}: ${error.message}`);
    }
    
    return false;
  }

  /**
   * Lists all plugin configurations
   * @returns {string[]} - Array of plugin names
   */
  listPluginConfigs() {
    try {
      const files = fs.readdirSync(this.pluginConfigDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * Shows current configuration
   */
  showConfig() {
    console.log('\n📋 Global Configuration:');
    console.log('='.repeat(40));
    
    console.log(`Debug: ${this.getConfig('settings.debug')}`);
    console.log(`Verbose: ${this.getConfig('settings.verbose')}`);
    console.log(`Colors: ${this.getConfig('settings.colors')}`);
    console.log(`Bootstrap Path: ${this.getConfig('settings.bootstrapPath')}`);
    console.log(`Output Directory: ${this.getConfig('settings.outputDirectory')}`);
    console.log(`Reports Directory: ${this.getConfig('settings.reportsDirectory')}`);
    
    console.log('\n🔌 Plugin Settings:');
    console.log(`Auto Load: ${this.getConfig('plugins.autoLoad')}`);
    console.log(`Auto Reload: ${this.getConfig('plugins.autoReload')}`);
    console.log(`Timeout: ${this.getConfig('plugins.timeout')}ms`);
    
    const pluginConfigs = this.listPluginConfigs();
    if (pluginConfigs.length > 0) {
      console.log('\n📦 Plugin Configurations:');
      for (const pluginName of pluginConfigs) {
        const config = this.getPluginConfig(pluginName);
        console.log(`  ${pluginName}: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      }
    }
  }

  /**
   * Merges configuration with command line options
   * @param {Object} options - Command line options
   * @returns {Object} - Merged configuration
   */
  mergeWithCliOptions(options = {}) {
    const merged = JSON.parse(JSON.stringify(this.config));
    
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
    
    return merged;
  }
}

module.exports = ConfigManager;
