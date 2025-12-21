const BaseBootstrapApp = require("./base-bootstrap-app.js");
const LoggingManager = require("./services/core/logging-manager.js");
const LoggingManagerConfig = require("./configs/logging-manager.js");
const Bootstrapper = require("./controllers/bootstrapper.js");
const BootstrapperConfig = require("./configs/bootstrapper.js");

/**
 * Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.
 */
class BootstrapApp extends BaseBootstrapApp {
  constructor(options = {}) {
    super(options);
    this.logging = this._resolveHelper("logging", "./cdn/logging.js");
    this.network = this._resolveHelper("network", "./cdn/network.js");
    this.moduleLoader = this._resolveHelper("moduleLoader", "./entrypoints/module-loader.js");
    this.loggingManager = new LoggingManager(
      new LoggingManagerConfig({
        logClient: this.logging.logClient,
        serializeForLog: this.logging.serializeForLog,
        serviceRegistry: require("./services/service-registry-instance.js"),
      })
    );
    this.bootstrapper = new Bootstrapper(
      new BootstrapperConfig({
        logging: this._loggingBindings(),
        network: this.network,
        moduleLoader: this.moduleLoader,
      })
    );
  }

  initialize() {
    this.loggingManager.initialize();
    this.bootstrapper.initialize();
    return this;
  }

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

  installLogging(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    this.loggingManager.install(windowObj);
  }

  runBootstrapper(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    if (windowObj.__RWTRA_BOOTSTRAP_TEST_MODE__) {
      return;
    }
    this.bootstrapper.bootstrap();
  }

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
