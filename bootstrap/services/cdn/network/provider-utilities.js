const BaseClass = require('../../../base/base-class.js');
const UtilitiesData = require('../../../data/utilities-data.js');

/**
 * ProviderUtilities - Handles provider URL normalization and processing
 * Enforces OO plugin rules with single business method
 */
class ProviderUtilities extends BaseClass {
  /**
   * Creates a new ProviderUtilities instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.defaultProtocol = data.defaultProtocol || 'https://';
    this.trailingSlash = data.trailingSlash !== false; // default true
  }

  /**
   * Initializes the provider utilities
   * @returns {Promise<ProviderUtilities>} The initialized instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - normalizes provider base URL
   * @param {string} provider - The provider URL or name
   * @returns {string} The normalized provider URL
   */
  normalizeProvider(provider) {
    if (!provider) return "";
    
    let normalized = provider.trim();
    
    // Handle relative paths starting with /
    if (normalized.startsWith("/")) {
      return this.trailingSlash ? 
        (normalized.endsWith("/") ? normalized : normalized + "/") :
        (normalized.endsWith("/") ? normalized.slice(0, -1) : normalized);
    }
    
    // Handle full URLs
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return this.trailingSlash ? 
        (normalized.endsWith("/") ? normalized : normalized + "/") :
        (normalized.endsWith("/") ? normalized.slice(0, -1) : normalized);
    }
    
    // Handle provider names - convert to full URL
    const cleanProvider = normalized.replace(/\/+$/, "");
    const fullUrl = this.defaultProtocol + cleanProvider;
    
    return this.trailingSlash ? 
      (fullUrl.endsWith("/") ? fullUrl : fullUrl + "/") :
      (fullUrl.endsWith("/") ? fullUrl.slice(0, -1) : fullUrl);
  }

  /**
   * Creates alias map using AliasMapCreator
   * @param {Object} source - Source object for aliases
   * @returns {Promise<Map>} Created alias map
   */
  async createAliasMap(source) {
    const AliasMapCreator = require('./alias-map-creator');
    const aliasMapCreator = new AliasMapCreator({ 
      source,
      providerUtilities: this
    });
    await aliasMapCreator.initialize();
    return await aliasMapCreator.execute();
  }

  /**
   * Batch normalize multiple providers
   * @param {Array<string>} providers - Array of provider URLs/names
   * @returns {Array<string>} Array of normalized URLs
   */
  batchNormalize(providers) {
    if (!Array.isArray(providers)) {
      throw new Error('Providers must be an array');
    }
    
    return providers.map(provider => this.normalizeProvider(provider));
  }

  /**
   * Validates provider format
   * @param {string} provider - Provider to validate
   * @returns {boolean} True if provider format is valid
   */
  isValidProvider(provider) {
    if (!provider || typeof provider !== 'string') {
      return false;
    }
    
    const normalized = this.normalizeProvider(provider);
    return normalized.length > 0;
  }
}

module.exports = ProviderUtilities;
