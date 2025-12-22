const BaseClassFactory = require('./base-class-factory.js');
const ServiceFactoryLoader = require('../registries/service-factory-loader.js');

/**
 * ServiceFactoryLoaderFactory - Factory for creating ServiceFactoryLoader instances
 * Enforces OO plugin rules with single business method
 */
class ServiceFactoryLoaderFactory extends BaseClassFactory {
  /**
   * Creates a new ServiceFactoryLoaderFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super({
      ...data,
      targetClass: 'ServiceFactoryLoader',
      dataClass: 'registry-data'
    });
  }

  /**
   * Initializes the service factory loader factory
   * @returns {Promise<ServiceFactoryLoaderFactory>} The initialized factory
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - creates ServiceFactoryLoader instances
   * @param {Object} config - Configuration for ServiceFactoryLoader
   * @returns {Promise<ServiceFactoryLoader>} The created ServiceFactoryLoader instance
   */
  async create(config = {}) {
    try {
      // Create data instance
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        registryType: 'service',
        factoryDefinitions: config.factoryDefinitions || [],
        createdAt: new Date()
      };
      
      // Use ServiceData for consistency
      const ServiceData = require('../data/service-data.js');
      const data = new ServiceData({
        ...dataConfig,
        serviceName: 'service-factory-loader',
        serviceType: 'registries'
      });
      await data.initialize();
      data.validate();
      
      // Create ServiceFactoryLoader instance
      const instance = new ServiceFactoryLoader(data);
      await instance.initialize();
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create ServiceFactoryLoader: ${error.message}`);
    }
  }

  /**
   * Gets target class constructor
   * @returns {Function} The ServiceFactoryLoader class constructor
   */
  getTargetClass() {
    return ServiceFactoryLoader;
  }

  /**
   * Creates ServiceFactoryLoader with default configuration
   * @returns {Promise<ServiceFactoryLoader>} ServiceFactoryLoader with default config
   */
  async createDefault() {
    return this.create({
      factoryDefinitions: []
    });
  }

  /**
   * Creates ServiceFactoryLoader with custom factory definitions
   * @param {Array} factoryDefinitions - Custom factory definitions
   * @returns {Promise<ServiceFactoryLoader>} ServiceFactoryLoader with custom definitions
   */
  async createWithDefinitions(factoryDefinitions) {
    return this.create({
      factoryDefinitions: factoryDefinitions || []
    });
  }
}

module.exports = ServiceFactoryLoaderFactory;
