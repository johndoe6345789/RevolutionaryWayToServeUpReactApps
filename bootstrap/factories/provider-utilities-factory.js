const BaseClassFactory = require('./base-class-factory.js');
const ProviderUtilities = require('../services/cdn/network/provider-utilities.js');

/**
 * ProviderUtilitiesFactory - Factory for creating ProviderUtilities instances
 * Enforces OO plugin rules with single business method
 */
class ProviderUtilitiesFactory extends BaseClassFactory {
  /**
   * Creates a new ProviderUtilitiesFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super({
      ...data,
      targetClass: 'ProviderUtilities',
      dataClass: 'utilities-data'
    });
  }

  /**
   * Initializes the provider utilities factory
   * @returns {Promise<ProviderUtilitiesFactory>} The initialized factory
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - creates ProviderUtilities instances
   * @param {Object} config - Configuration for ProviderUtilities
   * @returns {Promise<ProviderUtilities>} The created ProviderUtilities instance
   */
  async create(config = {}) {
    try {
      // Create data instance
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        utilityType: 'provider',
        utilityName: 'provider-utilities',
        createdAt: new Date()
      };
      
      const UtilitiesData = this.getDataClass();
      const data = new UtilitiesData(dataConfig);
      await data.initialize();
      data.validate();
      
      // Create ProviderUtilities instance
      const instance = new ProviderUtilities(data);
      await instance.initialize();
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create ProviderUtilities: ${error.message}`);
    }
  }

  /**
   * Gets target class constructor
   * @returns {Function} The ProviderUtilities class constructor
   */
  getTargetClass() {
    return ProviderUtilities;
  }

  /**
   * Creates ProviderUtilities with default configuration
   * @returns {Promise<ProviderUtilities>} ProviderUtilities with default config
   */
  async createDefault() {
    return this.create({
      defaultProtocol: 'https://',
      trailingSlash: true
    });
  }

  /**
   * Creates ProviderUtilities for CDN configuration
   * @returns {Promise<ProviderUtilities>} ProviderUtilities configured for CDN
   */
  async createForCdn() {
    return this.create({
      defaultProtocol: 'https://',
      trailingSlash: true,
      config: {
        enforceHttps: true,
        allowRelativePaths: true
      }
    });
  }

  /**
   * Creates ProviderUtilities for local development
   * @returns {Promise<ProviderUtilities>} ProviderUtilities configured for local dev
   */
  async createForLocal() {
    return this.create({
      defaultProtocol: 'http://',
      trailingSlash: false,
      config: {
        enforceHttps: false,
        allowRelativePaths: true
      }
    });
  }
}

module.exports = ProviderUtilitiesFactory;
