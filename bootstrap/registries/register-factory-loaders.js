/**
 * Registers factory loaders with the FactoryRegistry for lazy loading.
 * Factories will be loaded and registered only when they are first requested.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers all factory loaders with the FactoryRegistry.
 * This enables lazy loading of factories - they're only loaded when first requested.
 */
function registerFactoryLoaders() {
  // Register loader functions that will import and instantiate factories when needed
  factoryRegistry.registerLoader('baseBootstrapApp', function() {
    const BaseBootstrapAppFactory = require('../factories/core/base-bootstrap-app-factory.js');
    return function() { return new BaseBootstrapAppFactory().create(); };
  }, {}, []);

  factoryRegistry.registerLoader('globalRootHandler', function() {
    const GlobalRootHandlerFactory = require('../factories/core/global-root-handler-factory.js');
    return function(config) { return new GlobalRootHandlerFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('bootstrapper', function() {
    const BootstrapperFactory = require('../factories/core/bootstrapper-factory.js');
    return function(config) { return new BootstrapperFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('baseController', function() {
    const BaseControllerFactory = require('../factories/core/base-controller-factory.js');
    return function(config) { return new BaseControllerFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('baseHelper', function() {
    const BaseHelperFactory = require('../factories/core/base-helper-factory.js');
    return function(config) { return new BaseHelperFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('baseService', function() {
    const BaseServiceFactory = require('../factories/services/base-service-factory.js');
    return function(config) { return new BaseServiceFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('bootstrapApp', function() {
    const BootstrapAppFactory = require('../factories/core/bootstrap-app-factory.js');
    return function(config) { return new BootstrapAppFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('serviceRegistry', function() {
    const ServiceRegistryFactory = require('../factories/services/service-registry-factory.js');
    return function() { return new ServiceRegistryFactory().create(); };
  }, {}, []);

  factoryRegistry.registerLoader('controllerRegistry', function() {
    const ControllerRegistryFactory = require('../factories/services/controller-registry-factory.js');
    return function() { return new ControllerRegistryFactory().create(); };
  }, {}, []);

  factoryRegistry.registerLoader('factoryRegistry', function() {
    const FactoryRegistryFactory = require('../factories/services/factory-registry-factory.js');
    return function() { return new FactoryRegistryFactory().create(); };
  }, {}, []);

  factoryRegistry.registerLoader('helperRegistry', function() {
    const HelperRegistryFactory = require('../factories/services/helper-registry-factory.js');
    return function() { return new HelperRegistryFactory().create(); };
  }, {}, []);

  factoryRegistry.registerLoader('loggingManager', function() {
    const LoggingManagerFactory = require('../factories/services/logging-manager-factory.js');
    return function(config) { return new LoggingManagerFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('moduleLoaderService', function() {
    const ModuleLoaderServiceFactory = require('../factories/services/module-loader-service-factory.js');
    return function(config) { return new ModuleLoaderServiceFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('tsxCompilerService', function() {
    const TsxCompilerServiceFactory = require('../factories/local/tsx-compiler-service-factory.js');
    return function(config) { return new TsxCompilerServiceFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('sassCompilerService', function() {
    const SassCompilerServiceFactory = require('../factories/local/sass-compiler-service-factory.js');
    return function(config) { return new SassCompilerServiceFactory().create(config); };
  }, {}, []);

  factoryRegistry.registerLoader('baseEntryPoint', function() {
    const BaseEntryPointFactory = require('../factories/core/base-entrypoint-factory.js');
    return function(options) { return new BaseEntryPointFactory().create(options); };
  }, {}, []);
}

module.exports = {
  registerFactoryLoaders
};