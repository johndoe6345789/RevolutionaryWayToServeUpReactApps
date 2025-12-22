const BaseBootstrapApp = require("./interfaces/base-bootstrap-app.js");
const BootstrapAppConfig = require("./configs/core/bootstrap-app.js");
const LoggingManagerConfig = require("./configs/core/logging-manager.js");
const BootstrapperConfig = require("./configs/core/bootstrapper.js");
const LoggingService = require("./services/cdn/logging-service.js");
const LoggingServiceConfig = require("./configs/cdn/logging-service.js");
const NetworkProviderServiceConfig = require("./configs/cdn/network-provider-service.js");
const NetworkProbeServiceConfig = require("./configs/cdn/network-probe-service.js");
const ServiceRegistryConfig = require("./configs/services/service-registry.js");
const ConfigJsonParser = require("./configs/config-json-parser.js");
const factoryRegistry = require("./registries/factory-registry-instance.js");
const { registerAllFactoryLoaders } = require("./registries/comprehensive-factory-loaders.js");
const { getStringService } = require('../../string/string-service');
const strings = getStringService();


/**
 * Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.
 */
class BootstrapApp extends BaseBootstrapApp {
  constructor(config = new BootstrapAppConfig()) {
    super(config);
    // Only basic property setup in constructor - no initialization logic
  }

  /**
   * Initializes BootstrapApp with all services and dependencies.
   */
  async initialize() {
    this._ensureNotInitialized();
    
    // Register ALL factory loaders for complete factory system coverage
    registerAllFactoryLoaders();
    
    // Initialize config parser for config.json integration
    this.configParser = this.config.configParser || new ConfigJsonParser();
    
    // Create service registries using factories
    this.serviceRegistry = this.config.serviceRegistry ||
      factoryRegistry.create(strings.getMessage('serviceregistry'), new ServiceRegistryConfig());
    this.controllerRegistry = this.config.controllerRegistry ||
      factoryRegistry.create(strings.getMessage('controllerregistry'));
    
    // Create network services using factories
    this.networkProviderService = factoryRegistry.create(strings.getMessage('networkproviderservice'),
      this.config.networkProviderServiceConfig ||
      new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig()));
    this.networkProbeService = factoryRegistry.create(strings.getMessage('networkprobeservice'),
      this.config.networkProbeServiceConfig || new NetworkProbeServiceConfig());
    
    // Create logging service directly to avoid circular dependency issues
    this.loggingService = new LoggingService(this.config.loggingServiceConfig || 
      new LoggingServiceConfig({
        logEndpoint: this.config.logEndpoint || '/__client-log',
        enableConsole: this.config.enableConsole !== false,
        serviceRegistry: this.serviceRegistry,
      }));
    
    // For now, don't auto-resolve helpers to avoid circular dependencies
    // These can be accessed via lazy loading when needed
    this.logging = null;
    this.network = null;
    this.moduleLoader = null;
    
    // Create LoggingManager using factory with proper config
    const loggingManagerConfig = this.config.loggingManagerConfig || 
      new LoggingManagerConfig({
        logClient: this.loggingService.logClient,
        serializeForLog: this.loggingService.serializeForLog,
        serviceRegistry: this.serviceRegistry,
      });
    this.loggingManager = factoryRegistry.create(strings.getConsole('loggingmanager'), loggingManagerConfig);
    
    // Create Bootstrapper using factory with proper config
    const bootstrapperConfig = this.config.bootstrapperConfig || 
      new BootstrapperConfig({
        logging: this._loggingBindings(),
        network: this.network,
        moduleLoader: this.moduleLoader,
        controllerRegistry: this.controllerRegistry,
      });
    this.bootstrapper = factoryRegistry.create(strings.getMessage('bootstrapper'), bootstrapperConfig);
    
    // Initialize services
    await this.loggingService.initialize();
    await this.networkProviderService.initialize();
    await this.networkProbeService.initialize();
    await this.loggingManager.initialize();
    await this.bootstrapper.initialize();
    
    this._markInitialized();
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
      this.networkProviderService = factoryRegistry.create(strings.getMessage('networkproviderservice_1'),
        new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig()));
      
      return configJson;
    } catch (error) {
      console.error(strings.getError('failed_to_load_config_json'), error);
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
    // For now, return basic exports since we're refactoring
    return {
      loadConfig: this.bootstrapper.loadConfig.bind(this.bootstrapper),
      bootstrap: () => this.bootstrapper.bootstrap(),
      getServices: () => this.getServices(),
      loadConfigJson: () => this.loadConfigJson(),
    };
  }

  /**
   * Attaches the logging hooks to browsers that support strings.getConsole('window').
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
      this.loggingService;
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
