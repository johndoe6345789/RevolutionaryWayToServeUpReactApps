const BaseClass = require('../../../base/base-class.js');
const UtilitiesData = require('../../../data/utilities-data.js');

/**
 * AliasMapCreator - Creates alias maps for providers
 * Enforces OO plugin rules with single business method
 */
class AliasMapCreator extends BaseClass {
  /**
   * Creates a new AliasMapCreator instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.source = data.source;
    this.providerUtilities = data.providerUtilities;
  }

  /**
   * Initializes the alias map creator
   * @returns {Promise<AliasMapCreator>} The initialized instance
   */
  async initialize() {
    // Validate that we have a source
    if (!this.source) {
      throw new Error('Source object is required for alias map creation');
    }
    
    // If no provider utilities provided, create default
    if (!this.providerUtilities) {
      this.providerUtilities = require('./provider-utilities');
      const ProviderUtilities = this.providerUtilities;
      this.providerUtilities = new ProviderUtilities({});
      await this.providerUtilities.initialize();
    }
    
    return super.initialize();
  }

  /**
   * The ONE additional method - creates the alias map
   * @returns {Promise<Map>} The created alias map
   */
  async execute() {
    const map = new Map();
    
    if (this.source && typeof this.source === "object") {
      for (const [alias, value] of Object.entries(this.source)) {
        if (!alias) continue;
        
        try {
          const normalized = this.providerUtilities.normalizeProvider(value);
          if (normalized) {
            map.set(alias, normalized);
          }
        } catch (error) {
          // Skip invalid entries but continue processing
          console.warn(`Skipping invalid alias "${alias}": ${error.message}`);
        }
      }
    }
    
    return map;
  }

  /**
   * Gets alias count
   * @returns {Promise<number>} Number of aliases
   */
  async getAliasCount() {
    const map = await this.execute();
    return map.size;
  }

  /**
   * Checks if alias exists
   * @param {string} alias - Alias to check
   * @returns {Promise<boolean>} True if alias exists
   */
  async hasAlias(alias) {
    if (!alias) return false;
    
    const map = await this.execute();
    return map.has(alias);
  }

  /**
   * Gets normalized URL for alias
   * @param {string} alias - Alias to lookup
   * @returns {Promise<string|null>} Normalized URL or null
   */
  async getAliasUrl(alias) {
    if (!alias) return null;
    
    const map = await this.execute();
    return map.get(alias) || null;
  }

  /**
   * Validates source object structure
   * @returns {boolean} True if source is valid
   */
  validateSource() {
    if (!this.source || typeof this.source !== "object") {
      return false;
    }
    
    // Check if source has any valid string values
    for (const value of Object.values(this.source)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = AliasMapCreator;
