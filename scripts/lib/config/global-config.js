/**
 * Global Configuration
 * Handles global configuration management
 */

const fs = require('fs');
const path = require('path');

class GlobalConfig {
  constructor() {
    this.configDir = path.join(__dirname, '..', '..', 'config');
    this.globalConfigFile = path.join(this.configDir, 'global.json');
    this.config = {};
    
    this.ensureConfigDirectory();
    this.loadGlobalConfig();
  }

  /**
   * Ensures configuration directory exists
   */
  ensureConfigDirectory() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
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
        bootstrapPath: path.join(__dirname, '..', '..', '..'),
        outputDirectory: path.join(__dirname, '..', '..', 'output'),
        reportsDirectory: path.join(__dirname, '..', '..', 'reports')
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
   * @returns {boolean} - True if key was deleted
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
   * Shows current configuration
   */
  showConfig() {
    const { colors } = require('../../cli/utils/color-utils');
    
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
  }
}

module.exports = GlobalConfig;
