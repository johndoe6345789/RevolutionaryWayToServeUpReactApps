const BaseClass = require('../base/base-class.js');
const UtilitiesData = require('../data/utilities-data.js');

/**
 * DefaultProviderAliases - Handles default provider aliases configuration
 * Enforces OO plugin rules with single business method
 */
class DefaultProviderAliases extends BaseClass {
  /**
   * Creates a new DefaultProviderAliases instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.globalRoot = data.globalRoot;
    this.isCommonJs = data.isCommonJs;
    this.configPath = data.configPath || '../../config.json';
  }

  /**
   * Initializes the default provider aliases
   * @returns {Promise<DefaultProviderAliases>} The initialized instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - gets default aliases
   * @returns {Object} Default provider aliases
   */
  getAliases() {
    try {
      if (this.isCommonJs) {
        const cfg = require(this.configPath);
        return (cfg && cfg.providers && cfg.providers.aliases) || {};
      }
      
      if (
        this.globalRoot &&
        this.globalRoot.__rwtraConfig &&
        this.globalRoot.__rwtraConfig.providers &&
        this.globalRoot.__rwtraConfig.providers.aliases
      ) {
        return this.globalRoot.__rwtraConfig.providers.aliases;
      }
    } catch (err) {
      // Swallow errors when loading default aliases; an empty alias map is acceptable.
      console.warn(`Failed to load default provider aliases: ${err.message}`);
    }
    
    return {};
  }

  /**
   * Gets aliases as a Map
   * @returns {Map} Default provider aliases as Map
   */
  getAliasesAsMap() {
    const aliases = this.getAliases();
    const map = new Map();
    
    if (aliases && typeof aliases === "object") {
      for (const [alias, value] of Object.entries(aliases)) {
        if (alias && value) {
          map.set(alias, value);
        }
      }
    }
    
    return map;
  }

  /**
   * Checks if specific alias exists
   * @param {string} alias - Alias to check
   * @returns {boolean} True if alias exists
   */
  hasAlias(alias) {
    if (!alias) return false;
    
    const aliases = this.getAliases();
    return aliases.hasOwnProperty(alias);
  }

  /**
   * Gets specific alias value
   * @param {string} alias - Alias to get
   * @param {*} defaultValue - Default value if alias not found
   * @returns {*} Alias value or default
   */
  getAlias(alias, defaultValue = null) {
    if (!alias) return defaultValue;
    
    const aliases = this.getAliases();
    return aliases.hasOwnProperty(alias) ? aliases[alias] : defaultValue;
  }

  /**
   * Gets all alias names
   * @returns {Array<string>} Array of alias names
   */
  getAliasNames() {
    const aliases = this.getAliases();
    return Object.keys(aliases).filter(alias => alias && alias.length > 0);
  }

  /**
   * Gets alias count
   * @returns {number} Number of aliases
   */
  getAliasCount() {
    return this.getAliasNames().length;
  }

  /**
   * Validates alias configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    const aliases = this.getAliases();
    
    if (!aliases || typeof aliases !== "object") {
      return false;
    }
    
    // Check if aliases is not empty
    const keys = Object.keys(aliases);
    if (keys.length === 0) {
      return false;
    }
    
    // Check if all values are strings
    for (const value of Object.values(aliases)) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return false;
      }
    }
    
    return true;
  }
}

module.exports = DefaultProviderAliases;
