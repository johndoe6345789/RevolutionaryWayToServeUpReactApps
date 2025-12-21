const BaseBootstrapApp = require("./interfaces/base-bootstrap-app.js");
const LoggingManagerConfig = require("./configs/core/logging-manager.js");
const BootstrapperConfig = require("./configs/core/bootstrapper.js");
const factoryRegistry = require("./registries/factory-registry-instance.js");
const { registerBootstrapFactoryLoaders } = require("./registries/bootstrap-factory-loaders.js");

/**
 * Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.
 */
class BootstrapApp extends BaseBootstrapApp {
  constructor(options = {}) {
    super(options);
    
    // Register factory loaders once
    registerBootstrapFactoryLoaders();
    
    this.logging = this._resolveHelper("logging", "./cdn/logging.js");
    this.network = this._resolveHelper("network", "./cdn/network.js");
    this.moduleLoader = this._resolveHelper("moduleLoader", "./entrypoints/module-loader.js");
    
    // Create LoggingManager using factory with proper config
    const loggingManagerConfig = new LoggingManagerConfig({
      logClient: this.logging.logClient,
      serializeForLog: this.logging.serializeForLog,
      serviceRegistry: require("./registries/service-registry-instance.js"),
    });
    this.loggingManager = factoryRegistry.create('loggingManager', loggingManagerConfig);
    
    // Create Bootstrapper using factory with proper config
    const bootstrapperConfig = new BootstrapperConfig({
      logging: this._loggingBindings(),
      network: this.network,
      moduleLoader: this.moduleLoader,
      controllerRegistry: require("./registries/controller-registry-instance.js"),
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
