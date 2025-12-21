/**
 * Registers service registry factory loaders with the FactoryRegistry.
 * These factories handle the core service management infrastructure.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers service infrastructure factory loaders with the FactoryRegistry.
 * This enables lazy loading of service management components.
 */
function registerServiceFactoryLoaders() {
  // Register ServiceRegistry factory loader
  factoryRegistry.registerLoader('serviceRegistry', function() {
    const ServiceRegistryFactory = require('../factories/services/service-registry-factory.js');
    return function(config) { return new ServiceRegistryFactory().create(config); };
  }, { required: [] }, []);

  // Register ControllerRegistry factory loader
  factoryRegistry.registerLoader('controllerRegistry', function() {
    const ControllerRegistryFactory = require('../factories/services/controller-registry-factory.js');
    return function(config) { return new ControllerRegistryFactory().create(config); };
  }, { required: [] }, []);

  // Register FactoryRegistry factory loader
  factoryRegistry.registerLoader('factoryRegistry', function() {
    const FactoryRegistryFactory = require('../factories/services/factory-registry-factory.js');
    return function(config) { return new FactoryRegistryFactory().create(config); };
  }, { required: [] }, []);

  // Register HelperRegistry factory loader
  factoryRegistry.registerLoader('helperRegistry', function() {
    const HelperRegistryFactory = require('../factories/services/helper-registry-factory.js');
    return function(config) { return new HelperRegistryFactory().create(config); };
  }, { required: [] }, []);

  // Register ModuleLoaderService factory loader
  factoryRegistry.registerLoader('moduleLoaderService', function() {
    const ModuleLoaderServiceFactory = require('../factories/services/module-loader-service-factory.js');
    return function(config) { return new ModuleLoaderServiceFactory().create(config); };
  }, { required: [] }, []);
}

module.exports = {
  registerServiceFactoryLoaders
};
