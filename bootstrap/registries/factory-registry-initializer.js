const factoryRegistry = require('./factory-registry-instance.js');

// Import all the factories that were previously registered with FactoryManager
const BaseBootstrapAppFactory = require('../factories/core/base-bootstrap-app-factory.js');
const GlobalRootHandlerFactory = require('../factories/core/global-root-handler-factory.js');
const BootstrapperFactory = require('../factories/core/bootstrapper-factory.js');
const BaseControllerFactory = require('../factories/core/base-controller-factory.js');
const BaseHelperFactory = require('../factories/core/base-helper-factory.js');
const BaseServiceFactory = require('../factories/services/base-service-factory.js');
const BootstrapAppFactory = require('../factories/core/bootstrap-app-factory.js');
const ServiceRegistryFactory = require('../factories/services/service-registry-factory.js');
const ControllerRegistryFactory = require('../factories/services/controller-registry-factory.js');
const FactoryRegistryFactory = require('../factories/services/factory-registry-factory.js');
const HelperRegistryFactory = require('../factories/services/helper-registry-factory.js');
const LoggingManagerFactory = require('../factories/services/logging-manager-factory.js');
const ModuleLoaderServiceFactory = require('../factories/services/module-loader-service-factory.js');
const TsxCompilerServiceFactory = require('../factories/local/tsx-compiler-service-factory.js');
const SassCompilerServiceFactory = require('../factories/sass-compiler-service-factory.js');
const BaseEntryPointFactory = require('../factories/base-entrypoint-factory.js');

/**
 * Initializes the FactoryRegistry with all available factories.
 * This replaces the functionality that was previously provided by FactoryManager.
 * Since FactoryRegistry expects constructor functions but our factories extend BaseFactory
 * with a create() method, we wrap them in functions that call the create method.
 */
function initializeFactoryRegistry() {
  // Register all available factories with metadata and dependencies
  factoryRegistry.register('baseBootstrapApp', function() { return new BaseBootstrapAppFactory().create(); }, {}, []);
  factoryRegistry.register('globalRootHandler', function(config) { return new GlobalRootHandlerFactory().create(config); }, {}, []);
  factoryRegistry.register('bootstrapper', function(config) { return new BootstrapperFactory().create(config); }, {}, []);
  factoryRegistry.register('baseController', function(config) { return new BaseControllerFactory().create(config); }, {}, []);
  factoryRegistry.register('baseHelper', function(config) { return new BaseHelperFactory().create(config); }, {}, []);
  factoryRegistry.register('baseService', function(config) { return new BaseServiceFactory().create(config); }, {}, []);
  factoryRegistry.register('bootstrapApp', function(config) { return new BootstrapAppFactory().create(config); }, {}, []);
  factoryRegistry.register('serviceRegistry', function() { return new ServiceRegistryFactory().create(); }, {}, []);
  factoryRegistry.register('controllerRegistry', function() { return new ControllerRegistryFactory().create(); }, {}, []);
  factoryRegistry.register('factoryRegistry', function() { return new FactoryRegistryFactory().create(); }, {}, []);
  factoryRegistry.register('helperRegistry', function() { return new HelperRegistryFactory().create(); }, {}, []);
  factoryRegistry.register('loggingManager', function(config) { return new LoggingManagerFactory().create(config); }, {}, []);
  factoryRegistry.register('moduleLoaderService', function(config) { return new ModuleLoaderServiceFactory().create(config); }, {}, []);
  factoryRegistry.register('tsxCompilerService', function(config) { return new TsxCompilerServiceFactory().create(config); }, {}, []);
  factoryRegistry.register('sassCompilerService', function(config) { return new SassCompilerServiceFactory().create(config); }, {}, []);
  factoryRegistry.register('baseEntryPoint', function(options) { return new BaseEntryPointFactory().create(options); }, {}, []);
}

module.exports = {
  initializeFactoryRegistry
};