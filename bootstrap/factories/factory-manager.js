const BaseFactory = require('./base-factory.js');
const BaseBootstrapAppFactory = require('./core/base-bootstrap-app-factory.js');
const GlobalRootHandlerFactory = require('./core/global-root-handler-factory.js');
const BootstrapperFactory = require('./core/bootstrapper-factory.js');
const BaseControllerFactory = require('./core/base-controller-factory.js');
const BaseHelperFactory = require('./core/base-helper-factory.js');
const BaseServiceFactory = require('./services/base-service-factory.js');
const BootstrapAppFactory = require('./core/bootstrap-app-factory.js');
const ServiceRegistryFactory = require('./services/service-registry-factory.js');
const ControllerRegistryFactory = require('./services/controller-registry-factory.js');
const FactoryRegistryFactory = require('./services/factory-registry-factory.js');
const HelperRegistryFactory = require('./services/helper-registry-factory.js');
const LoggingManagerFactory = require('./services/logging-manager-factory.js');
const ModuleLoaderServiceFactory = require('./services/module-loader-service-factory.js');
const TsxCompilerServiceFactory = require('./local/tsx-compiler-service-factory.js');
const SassCompilerServiceFactory = require('./local/sass-compiler-service-factory.js');
const BaseEntryPointFactory = require('./core/base-entrypoint-factory.js');
const NetworkProviderServiceFactory = require('./cdn/network-provider-service-factory.js');
const NetworkProbeServiceFactory = require('./cdn/network-probe-service-factory.js');
const factoryRegistryInstance = require('../registries/factory-registry-instance.js');

/**
 * Factory manager that provides access to all available factories.
 */
class FactoryManager {
  constructor() {
    this.factories = new Map();

    // Register all available factories
    this.registerFactory('baseBootstrapApp', new BaseBootstrapAppFactory());
    this.registerFactory('globalRootHandler', new GlobalRootHandlerFactory());
    this.registerFactory('bootstrapper', new BootstrapperFactory());
    this.registerFactory('baseController', new BaseControllerFactory());
    this.registerFactory('baseHelper', new BaseHelperFactory());
    this.registerFactory('baseService', new BaseServiceFactory());
    this.registerFactory('bootstrapApp', new BootstrapAppFactory());
    this.registerFactory('serviceRegistry', new ServiceRegistryFactory());
    this.registerFactory('controllerRegistry', new ControllerRegistryFactory());
    this.registerFactory('factoryRegistry', new FactoryRegistryFactory());
    this.registerFactory('helperRegistry', new HelperRegistryFactory());
    this.registerFactory('loggingManager', new LoggingManagerFactory());
    this.registerFactory('moduleLoaderService', new ModuleLoaderServiceFactory());
    this.registerFactory('tsxCompilerService', new TsxCompilerServiceFactory());
    this.registerFactory('sassCompilerService', new SassCompilerServiceFactory());
    this.registerFactory('baseEntryPoint', new BaseEntryPointFactory());
    this.registerFactory('networkProviderService', new NetworkProviderServiceFactory());
    this.registerFactory('networkProbeService', new NetworkProbeServiceFactory());

    // Register this factory manager in the global factory registry
    try {
      factoryRegistryInstance.register('factoryManager', () => this, {
        folder: 'factories',
        domain: 'core'
      }, []);
    } catch (e) {
      // If factory registry is not available, continue without registration
      // This allows the system to work in environments where the factory registry isn't set up
    }
  }

  /**
   * Registers a factory with the given name.
   * @param {string} name - The name of the factory
   * @param {BaseFactory} factory - The factory instance
   */
  registerFactory(name, factory) {
    if (!(factory instanceof BaseFactory)) {
      throw new Error(`Factory must extend BaseFactory: ${factory.constructor.name}`);
    }
    this.factories.set(name, factory);
  }

  /**
   * Gets a factory by name.
   */
  getFactory(name) {
    return this.factories.get(name);
  }

  /**
   * Creates an instance using the specified factory.
   */
  create(name, ...args) {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Factory not found: ${name}`);
    }
    return factory.create(...args);
  }

  /**
   * Lists all registered factory names.
   */
  listFactories() {
    return Array.from(this.factories.keys());
  }
}

module.exports = FactoryManager;