const LocalLoaderConfig = require("../../configs/local-loader.js");

/**
 * Combines sass/tsx/local helpers into the shared local loader surface.
 */
class LocalLoaderService {
  static helperRegistry = require("./helpers");

  constructor(config = new LocalLoaderConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("LocalLoaderService already initialized");
    }
    this.initialized = true;
    this.overrides = this.config.dependencies || {};
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for LocalLoaderService");
    }
    const FrameworkRenderer = LocalLoaderService.helperRegistry.getHelper("frameworkRenderer");
    if (!FrameworkRenderer) {
      throw new Error("FrameworkRenderer helper missing from helper registry");
    }
    const rendererConfig = new FrameworkRenderer.Config({
      document: this.config.document,
    });
    this.frameworkRenderer = new FrameworkRenderer(rendererConfig);
    this.frameworkRenderer.initialize();
    this.namespace = this.config.namespace || {};
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging = this._resolveDependency("logging");
    this.dynamicModules = this._resolveDependency("dynamicModules");
    this.sassCompiler = this._resolveDependency("sassCompiler");
    this.tsxCompiler = this._resolveDependency("tsxCompiler");
    this.localPaths = this._resolveDependency("localPaths");
    this.moduleLoader = this._resolveDependency("localModuleLoader");
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadDynamicModule =
      (this.dynamicModules && this.dynamicModules.loadDynamicModule) ||
      (() => Promise.reject(new Error("dynamic loader missing")));
    this.compileSCSS = this.sassCompiler?.compileSCSS;
    this.injectCSS = this.sassCompiler?.injectCSS;
    this.compileTSX = this.tsxCompiler?.compileTSX;
    this.transformSource = this.tsxCompiler?.transformSource;
    this.executeModuleSource = this.tsxCompiler?.executeModuleSource;
    this.isLocalModule = this.localPaths?.isLocalModule;
    this.normalizeDir = this.localPaths?.normalizeDir;
    this.makeAliasKey = this.localPaths?.makeAliasKey;
    this.getModuleDir = this.localPaths?.getModuleDir;
    this.localModuleLoader = this.moduleLoader?.createLocalModuleLoader;
    this.fetchLocalModuleSource = this.moduleLoader?.fetchLocalModuleSource;
    const LocalRequireBuilder = LocalLoaderService.helperRegistry.getHelper("localRequireBuilder");
    if (!LocalRequireBuilder) {
      throw new Error("LocalRequireBuilder helper missing from helper registry");
    }
    this.requireBuilder = new LocalRequireBuilder({
      loadDynamicModule: this.loadDynamicModule,
      isLocalModule: this.isLocalModule,
    });
    this.serviceRegistry.register("localLoader", this.exports, {
      folder: "services/local",
      domain: "local",
    });
  }

  frameworkRender(config, registry, App) {
    return this.frameworkRenderer.render(config, registry, App);
  }

  createRequire(
    registry,
    config,
    entryDir = "",
    localModuleLoader,
    dynamicModuleLoader
  ) {
    return this.requireBuilder.create({
      registry,
      config,
      entryDir,
      localModuleLoader,
      dynamicModuleLoader,
      argumentCount: arguments.length,
    });
  }

  _resolveDependency(name) {
    if (this.overrides[name]) {
      return this.overrides[name];
    }
    const service = this.serviceRegistry?.getService(name);
    if (service) {
      return service;
    }
    return this.helpers[name] || {};
  }

  get exports() {
    return Object.assign(
      {},
      this.sassCompiler || {},
      this.tsxCompiler || {},
      this.localPaths || {},
      this.moduleLoader || {},
      {
        frameworkRender: this.frameworkRender.bind(this),
        createRequire: this.createRequire.bind(this),
      }
    );
  }

  install() {
    if (!this.initialized) {
      throw new Error("LocalLoaderService not initialized");
    }
    const exports = this.exports;
    this.helpers.localLoader = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

module.exports = LocalLoaderService;
