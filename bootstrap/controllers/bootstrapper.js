const GlobalRootHandler = require("../constants/global-root-handler.js");
const BaseController = require("./base-controller.js");
const BootstrapperConfig = require("../configs/core/bootstrapper.js");

const rootHandler = new GlobalRootHandler();
const hasDocument = rootHandler.hasDocument();
const hasWindow = rootHandler.hasWindow();

/**
 * Drives the overall bootstrap workflow (config, module loading, rendering, logging).
 */
class Bootstrapper extends BaseController {
  /**
   * Initializes a new Bootstrapper instance with the provided configuration.
   */
  constructor(config = {}) {
    const normalized =
      config instanceof BootstrapperConfig ? config : new BootstrapperConfig(config);
    super(normalized);
    this.cachedConfigPromise = null;
    this.fetchImpl = this.config.fetch ?? rootHandler.getFetch();
  }

  /**
   * Sets up the Bootstrapper instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    const { logging, network, moduleLoader } = this.config;
    this.logging = logging;
    this.network = network;
    this.moduleLoader = moduleLoader;
    this.setCiLoggingEnabled = logging.setCiLoggingEnabled;
    this.detectCiLogging = logging.detectCiLogging;
    this.logClient = logging.logClient;
    this.isCiLoggingEnabled = logging.isCiLoggingEnabled;

    this._markInitialized();

    // Register this controller in the registry after initialization
    this.register("bootstrapper", {
      folder: "controllers",
      domain: "core",
    }, []);
  }

  /**
   * Runs the bootstrap flow for Bootstrapper.
   */
  async bootstrap() {
    try {
      await this._bootstrap();
    } catch (err) {
      this._handleBootstrapError(err);
    }
  }

  /**
   * Performs the internal bootstrap steps for Bootstrapper.
   */
  async _bootstrap() {
    this._ensureInitialized();
    const config = await this.loadConfig();
    this._configureProviders(config);
    const entryFile = config.entry || "main.tsx";
    const scssFile = config.styles || "styles.scss";

    await this._prepareAssets(scssFile, config.tools);
    const { registry, entryDir, requireFn } = await this._prepareModules(
      entryFile,
      config
    );
    await this._compileAndRender(entryFile, scssFile, config, registry, entryDir, requireFn);
  }

  /**
   * Compiles and injects styles, and prepares any requested tools.
   */
  async _prepareAssets(scssFile, tools) {
    await this.moduleLoader.loadTools(tools || []);
    const css = await this.moduleLoader.compileSCSS(scssFile);
    this.moduleLoader.injectCSS(css);
  }

  /**
   * Loads modules, builds the require helper, and returns the helper artifacts.
   */
  async _prepareModules(entryFile, config) {
    const registry = await this.moduleLoader.loadModules(config.modules || []);
    const entryDir = this._determineEntryDir(entryFile);
    const localLoader = this.moduleLoader.createLocalModuleLoader(entryDir);
    const requireFn = this.moduleLoader.createRequire(
      registry,
      config,
      entryDir,
      localLoader
    );
    return { registry, entryDir, requireFn };
  }

  /**
   * Compiles the TSX entry, renders the application, and emits a success log.
   */
  async _compileAndRender(
    entryFile,
    scssFile,
    config,
    registry,
    entryDir,
    requireFn
  ) {
    const App = await this.moduleLoader.compileTSX(entryFile, requireFn, entryDir);
    this.moduleLoader.frameworkRender(config, registry, App);
    this.logClient("bootstrap:success", { entryFile, scssFile });
  }

  /**
   * Configures the providers that Bootstrapper will use.
   */
  _configureProviders(config) {
    this.network.setFallbackProviders(config.fallbackProviders);
    this.network.setDefaultProviderBase(config.providers && config.providers.default);
    this.network.setProviderAliases(config.providers && config.providers.aliases);
    this._enableCiLogging(config);
  }

  /**
   * Loads the runtime configuration for Bootstrapper.
   */
  async loadConfig() {
    const cachedFromWindow = this._readWindowConfigCache();
    if (cachedFromWindow) {
      return cachedFromWindow;
    }
    this._ensureInitialized();
    this._ensureCachedConfigPromise();
    return this._consumeConfigPromise();
  }

  /**
   * Returns any config value or promise that has already been cached on `window`.
   */
  _readWindowConfigCache() {
    if (!hasWindow) {
      return null;
    }
    if (window.__rwtraConfig) {
      return Promise.resolve(window.__rwtraConfig);
    }
    if (window.__rwtraConfigPromise) {
      return window.__rwtraConfigPromise;
    }
    return null;
  }

  /**
   * Ensures the internal promise has been created and mirrored on `window`.
   */
  _ensureCachedConfigPromise() {
    if (!this.cachedConfigPromise) {
      this.cachedConfigPromise = this._fetchConfig();
      if (hasWindow) {
        window.__rwtraConfigPromise = this.cachedConfigPromise;
      }
    }
  }

  /**
   * Awaits the cached promise, writes the result to `window`, and returns the config.
   */
  async _consumeConfigPromise() {
    const config = await this.cachedConfigPromise;
    this._writeWindowConfig(config);
    return config;
  }

  /**
   * Saves the resolved config object on `window` when available.
   */
  _writeWindowConfig(config) {
    if (hasWindow) {
      window.__rwtraConfig = config;
    }
  }

  /**
   * Fetches config.json via the configured fetch implementation.
   */
  async _fetchConfig() {
    if (!this.fetchImpl) {
      throw new Error("Fetch is unavailable when loading config.json");
    }
    const url = this.config.configUrl ?? "config.json";
    const response = await this.fetchImpl(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    return response.json();
  }

  /**
   * Enables CI logging helpers for Bootstrapper.
   */
  _enableCiLogging(config) {
    this.setCiLoggingEnabled(this.detectCiLogging(config));
    if (this.isCiLoggingEnabled()) {
      this.logClient("ci:enabled", {
        config: !!config,
        href: this._windowHref(),
      });
    }
  }

  /**
   * Performs the internal window href step for Bootstrapper.
   */
  _windowHref() {
    if (hasWindow && window.location) {
      return window.location.href;
    }
    return undefined;
  }

  /**
   * Performs the internal determine entry dir step for Bootstrapper.
   */
  _determineEntryDir(entryFile) {
    if (!entryFile.includes("/")) {
      return "";
    }
    return entryFile.slice(0, entryFile.lastIndexOf("/"));
  }

  /**
   * Handles bootstrap failures for Bootstrapper.
   */
  _handleBootstrapError(err) {
    console.error(err);
    this.logClient("bootstrap:error", {
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
    });
    this._renderBootstrapError(err);
  }

  /**
   * Renders the bootstrap error UI for Bootstrapper.
   */
  _renderBootstrapError(err) {
    if (!hasDocument) {
      return;
    }
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const message = err && err.message ? err.message : err;
    root.textContent = "Bootstrap error: " + message;
  }
}

module.exports = Bootstrapper;
