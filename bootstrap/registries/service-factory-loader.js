const BaseClass = require('../base/base-class.js');
const ServiceData = require('../data/service-data.js');

/**
 * ServiceFactoryLoader - Loads and registers service factories
 * Enforces OO plugin rules with single business method
 */
class ServiceFactoryLoader extends BaseClass {
  /**
   * Creates a new ServiceFactoryLoader instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.factoryRegistry = null;
    this.factoryDefinitions = data.factoryDefinitions || [];
  }

  /**
   * Initializes the service factory loader
   * @returns {Promise<ServiceFactoryLoader>} The initialized instance
   */
  async initialize() {
    this.factoryRegistry = require('./factory-registry-instance.js');
    return super.initialize();
  }

  /**
   * The ONE additional method - registers all service factories
   * @returns {Promise<Array>} Array of registered factory names
   */
  async registerAllFactories() {
    const registeredFactories = [];
    
    // Register core service factories
    registeredFactories.push(await this.registerServiceRegistry());
    registeredFactories.push(await this.registerControllerRegistry());
    registeredFactories.push(await this.registerFactoryRegistry());
    registeredFactories.push(await this.registerHelperRegistry());
    registeredFactories.push(await this.registerModuleLoaderService());
    
    return registeredFactories;
  }

  /**
   * Registers ServiceRegistry factory
   * @returns {Promise<string>} Name of registered factory
   */
  async registerServiceRegistry() {
    const factoryName = 'serviceRegistry';
    
    this.factoryRegistry.registerLoader(factoryName, function() {
      const ServiceRegistryFactory = require('../factories/services/service-registry-factory.js');
      return function(config) { 
        return new ServiceRegistryFactory().create(config); 
      };
    }, { required: [] }, []);
    
    return factoryName;
  }

  /**
   * Registers ControllerRegistry factory
   * @returns {Promise<string>} Name of registered factory
   */
  async registerControllerRegistry() {
    const factoryName = 'controllerRegistry';
    
    this.factoryRegistry.registerLoader(factoryName, function() {
      const ControllerRegistryFactory = require('../factories/services/controller-registry-factory.js');
      return function(config) { 
        return new ControllerRegistryFactory().create(config); 
      };
    }, { required: [] }, []);
    
    return factoryName;
  }

  /**
   * Registers FactoryRegistry factory
   * @returns {Promise<string>} Name of registered factory
   */
  async registerFactoryRegistry() {
    const factoryName = 'factoryRegistry';
    
    this.factoryRegistry.registerLoader(factoryName, function() {
      const FactoryRegistryFactory = require('../factories/services/factory-registry-factory.js');
      return function(config) { 
        return new FactoryRegistryFactory().create(config); 
      };
    }, { required: [] }, []);
    
    return factoryName;
  }

  /**
   * Registers HelperRegistry factory
   * @returns {Promise<string>} Name of registered factory
   */
  async registerHelperRegistry() {
    const factoryName = 'helperRegistry';
    
    this.factoryRegistry.registerLoader(factoryName, function() {
      const HelperRegistryFactory = require('../factories/services/helper-registry-factory.js');
      return function(config) { 
        return new HelperRegistryFactory().create(config); 
      };
    }, { required: [] }, []);
    
    return factoryName;
  }

  /**
   * Registers ModuleLoaderService factory
   * @returns {Promise<string>} Name of registered factory
   */
  async registerModuleLoaderService() {
    const factoryName = 'moduleLoaderService';
    
    this.factoryRegistry.registerLoader(factoryName, function() {
      const ModuleLoaderServiceFactory = require('../factories/services/module-loader-service-factory.js');
      return function(config) { 
        return new ModuleLoaderServiceFactory().create(config); 
      };
    }, { required: [] }, []);
    
    return factoryName;
  }

  /**
   * Gets registered factory count
   * @returns {Promise<number>} Number of registered factories
   */
  async getRegisteredCount() {
    const registeredFactories = await this.registerAllFactories();
    return registeredFactories.length;
  }

  /**
   * Checks if factory is registered
   * @param {string} factoryName - Factory name to check
   * @returns {boolean} True if factory is registered
   */
  isFactoryRegistered(factoryName) {
    return this.factoryRegistry.hasLoader(factoryName);
  }

  /**
   * Gets list of registered service factories
   * @returns {Array<string>} Array of registered factory names
   */
  getRegisteredFactories() {
    const allLoaders = this.factoryRegistry.getLoaders();
    return Object.keys(allLoaders).filter(name => 
      ['serviceRegistry', 'controllerRegistry', 'factoryRegistry', 'helperRegistry', 'moduleLoaderService'].includes(name)
    );
  }
}

module.exports = ServiceFactoryLoader;
