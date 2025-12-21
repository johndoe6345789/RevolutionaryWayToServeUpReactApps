/**
 * Registers core factory loaders with the FactoryRegistry.
 * These factories handle the core bootstrap application components.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers core factory loaders with the FactoryRegistry.
 * This enables lazy loading of core bootstrap components.
 */
function registerCoreFactoryLoaders() {
  // Register BaseBootstrapApp factory loader
  factoryRegistry.registerLoader('baseBootstrapApp', function() {
    const BaseBootstrapAppFactory = require('../factories/core/base-bootstrap-app-factory.js');
    return function(config) { return new BaseBootstrapAppFactory().create(config); };
  }, { required: [] }, []);

  // Register GlobalRootHandler factory loader
  factoryRegistry.registerLoader('globalRootHandler', function() {
    const GlobalRootHandlerFactory = require('../factories/core/global-root-handler-factory.js');
    return function(config) { return new GlobalRootHandlerFactory().create(config); };
  }, { required: [] }, []);

  // Register BaseController factory loader
  factoryRegistry.registerLoader('baseController', function() {
    const BaseControllerFactory = require('../factories/core/base-controller-factory.js');
    return function(config) { return new BaseControllerFactory().create(config); };
  }, { required: [] }, []);

  // Register BaseHelper factory loader
  factoryRegistry.registerLoader('baseHelper', function() {
    const BaseHelperFactory = require('../factories/core/base-helper-factory.js');
    return function(config) { return new BaseHelperFactory().create(config); };
  }, { required: [] }, []);

  // Register BootstrapApp factory loader
  factoryRegistry.registerLoader('bootstrapApp', function() {
    const BootstrapAppFactory = require('../factories/core/bootstrap-app-factory.js');
    return function(config) { return new BootstrapAppFactory().create(config); };
  }, { required: [] }, []);

  // Register BaseEntrypoint factory loader
  factoryRegistry.registerLoader('baseEntrypoint', function() {
    const BaseEntrypointFactory = require('../factories/core/base-entrypoint-factory.js');
    return function(config) { return new BaseEntrypointFactory().create(config); };
  }, { required: [] }, []);

  // Register Config factory loader
  factoryRegistry.registerLoader('config', function() {
    const ConfigFactory = require('../factories/core/config-factory.js');
    return function(config) { return new ConfigFactory().create(config); };
  }, { required: [] }, []);
}

module.exports = {
  registerCoreFactoryLoaders
};
