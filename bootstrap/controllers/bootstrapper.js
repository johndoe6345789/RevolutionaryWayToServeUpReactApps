const hasDocument = typeof document !== "undefined";
const hasWindow = typeof window !== "undefined";

/**
 * Drives the overall bootstrap workflow (config, module loading, rendering, logging).
 */
class Bootstrapper {
  constructor(config) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("Bootstrapper already initialized");
    }
    this.initialized = true;
    const { configLoader, logging, network, moduleLoader } = this.config;
    this.configLoader = configLoader;
    this.logging = logging;
    this.network = network;
    this.moduleLoader = moduleLoader;
    this.setCiLoggingEnabled = logging.setCiLoggingEnabled;
    this.detectCiLogging = logging.detectCiLogging;
    this.logClient = logging.logClient;
    this.isCiLoggingEnabled = logging.isCiLoggingEnabled;
  }

  async bootstrap() {
    try {
      await this._bootstrap();
    } catch (err) {
      this._handleBootstrapError(err);
    }
  }

  async _bootstrap() {
    if (!this.initialized) {
      throw new Error("Bootstrapper not initialized");
    }
    const config = await this.configLoader.loadConfig();
    this._configureProviders(config);
    const entryFile = config.entry || "main.tsx";
    const scssFile = config.styles || "styles.scss";

    await this.moduleLoader.loadTools(config.tools || []);

    const css = await this.moduleLoader.compileSCSS(scssFile);
    this.moduleLoader.injectCSS(css);

    const registry = await this.moduleLoader.loadModules(config.modules || []);
    const entryDir = this._determineEntryDir(entryFile);
    const localLoader = this.moduleLoader.createLocalModuleLoader(entryDir);
    const requireFn = this.moduleLoader.createRequire(
      registry,
      config,
      entryDir,
      localLoader
    );

    const App = await this.moduleLoader.compileTSX(entryFile, requireFn, entryDir);

    this.moduleLoader.frameworkRender(config, registry, App);
    this.logClient("bootstrap:success", { entryFile, scssFile });
  }

  _configureProviders(config) {
    this.network.setFallbackProviders(config.fallbackProviders);
    this.network.setDefaultProviderBase(config.providers && config.providers.default);
    this.network.setProviderAliases(config.providers && config.providers.aliases);
    this._enableCiLogging(config);
  }

  _enableCiLogging(config) {
    this.setCiLoggingEnabled(this.detectCiLogging(config));
    if (this.isCiLoggingEnabled()) {
      this.logClient("ci:enabled", {
        config: !!config,
        href: this._windowHref(),
      });
    }
  }

  _windowHref() {
    if (hasWindow && window.location) {
      return window.location.href;
    }
    return undefined;
  }

  _determineEntryDir(entryFile) {
    if (!entryFile.includes("/")) {
      return "";
    }
    return entryFile.slice(0, entryFile.lastIndexOf("/"));
  }

  _handleBootstrapError(err) {
    console.error(err);
    this.logClient("bootstrap:error", {
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
    });
    this._renderBootstrapError(err);
  }

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
