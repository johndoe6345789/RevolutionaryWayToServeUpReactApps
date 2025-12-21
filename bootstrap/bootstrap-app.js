const BaseBootstrapApp = require("./interfaces/base-bootstrap-app.js");
const LoggingManagerConfig = require("./configs/core/logging-manager.js");
const BootstrapperConfig = require("./configs/core/bootstrapper.js");
const LoggingServiceConfig = require("./configs/cdn/logging-service.js");
const NetworkProviderServiceConfig = require("./configs/cdn/network-provider-service.js");
const NetworkProbeServiceConfig = require("./configs/cdn/network-probe-service.js");
const ServiceRegistryConfig = require("./configs/services/service-registry.js");
const ConfigJsonParser = require("./configs/config-json-parser.js");
const factoryRegistry = require("./registries/factory-registry-instance.js");
const { registerAllFactoryLoaders } = require("./registries/comprehensive-factory-loaders.js");

/**
 * Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.
 */
class BootstrapApp extends BaseBootstrapApp {
  constructor(options = {}) {
    super(options);
    
    // Register ALL factory loaders for complete factory system coverage
    registerAllFactoryLoaders();
    
    // Initialize config parser for config.json integration
    this.configParser = new ConfigJsonParser();
    
    // Create service registries using factories
    this.serviceRegistry = factoryRegistry.create('serviceRegistry', new ServiceRegistryConfig());
    this.controllerRegistry = factoryRegistry.create('controllerRegistry');
    
    // Create network services using factories
    this.networkProviderService = factoryRegistry.create('networkProviderService', 
      new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig()));
    this.networkProbeService = factoryRegistry.create('networkProbeService', 
      new NetworkProbeServiceConfig());
    
    // Create logging service using factory
    this.loggingService = factoryRegistry.create('loggingService', 
      new LoggingServiceConfig({
        logEndpoint: options.logEndpoint || '/__client-log',
        enableConsole: options.enableConsole !== false,
      }));
    
    // Resolve helpers (keep existing pattern for now, but could be factory-based)
    this.logging = this._resolveHelper("logging", "./cdn/logging.js");
    this.network = this._resolveHelper("network", "./cdn/network.js");
    this.moduleLoader = this._resolveHelper("moduleLoader", "./entrypoints/module-loader.js");
    
    // Create LoggingManager using factory with proper config
    const loggingManagerConfig = new LoggingManagerConfig({
      logClient: this.logging.logClient,
      serializeForLog: this.logging.serializeForLog,
      serviceRegistry: this.serviceRegistry,
    });
    this.loggingManager = factoryRegistry.create('loggingManager', loggingManagerConfig);
    
    // Create Bootstrapper using factory with proper config
    const bootstrapperConfig = new BootstrapperConfig({
      logging: this._loggingBindings(),
      network: this.network,
      moduleLoader: this.moduleLoader,
      controllerRegistry: this.controllerRegistry,
    });
    this.bootstrapper = factoryRegistry.create('bootstrapper', bootstrapperConfig);
  }

  /**
   * Boots up the logging manager followed by the bootstrapper.
   */
  initialize() {
    this.loggingManager.initialize();
    this.bootstrapper.initialize();
    return this;
  }

  /**
   * Loads config.json and integrates with factory system
   */
  async loadConfigJson() {
    try {
      const response = await fetch(this.bootstrapper.config.configUrl || 'config.json');
      const configJson = await response.json();
      
      // Update config parser with loaded config
      this.configParser = new ConfigJsonParser(configJson);
      
      // Re-create network provider service with config.json settings
      this.networkProviderService = factoryRegistry.create('networkProviderService', 
        new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig()));
      
      return configJson;
    } catch (error) {
      console.error('Failed to load config.json:', error);
      return {};
    }
  }

  /**
   * Gets factory-created services for advanced usage
   */
  getServices() {
    return {
      serviceRegistry: this.serviceRegistry,
      controllerRegistry: this.controllerRegistry,
      networkProviderService: this.networkProviderService,
      networkProbeService: this.networkProbeService,
      loggingService: this.loggingService,
      configParser: this.configParser,
    };
  }

  /**
   * Gathers the set of helper exports that should be exposed to consumers.
   */
  getExports() {
    const {
      loadTools,
      makeNamespace,
      loadModules,
      loadDynamicModule,
      createRequire,
      compileSCSS,
      injectCSS,
      collectDynamicModuleImports,
      preloadDynamicModulesFromSource,
      collectModuleSpecifiers,
      preloadModulesFromSource,
      compileTSX,
      frameworkRender,
      loadScript,
    } = this.moduleLoader;

    const { normalizeProviderBase, probeUrl, resolveModuleUrl } = this.network;

    return {
      loadConfig: this.bootstrapper.loadConfig.bind(this.bootstrapper),
      loadScript,
      normalizeProviderBase,
      probeUrl,
      resolveModuleUrl,
      loadTools,
      makeNamespace,
      loadModules,
      loadDynamicModule,
      createRequire,
      compileSCSS,
      injectCSS,
      collectDynamicModuleImports,
      preloadDynamicModulesFromSource,
      collectModuleSpecifiers,
      preloadModulesFromSource,
      compileTSX,
      frameworkRender,
      bootstrap: () => this.bootstrapper.bootstrap(),
      getServices: () => this.getServices(),
      loadConfigJson: () => this.loadConfigJson(),
    };
  }

  /**
   * Attaches the logging hooks to browsers that support `window`.
   */
  installLogging(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    this.loggingManager.install(windowObj);
  }

  /**
   * Triggers the bootstrapper in browser contexts when not running tests.
   */
  runBootstrapper(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    if (windowObj.__RWTRA_BOOTSTRAP_TEST_MODE__) {
      return;
    }
    this.bootstrapper.bootstrap();
  }

  /**
   * Provides the logging manager with the helper bindings it consumes.
   */
  _loggingBindings() {
    const { setCiLoggingEnabled, detectCiLogging, logClient, serializeForLog, isCiLoggingEnabled } =
      this.logging;
    return {
      setCiLoggingEnabled,
      detectCiLogging,
      logClient,
      serializeForLog,
      isCiLoggingEnabled,
    };
  }
}

module.exports = BootstrapApp;
