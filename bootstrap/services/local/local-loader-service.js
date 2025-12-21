const BaseService = require("../base-service.js");
const LocalLoaderConfig = require("../../configs/local-loader.js");

const LocalDependencyLoaderConfig = require("../../configs/local-dependency-loader.js");

class LocalLoaderInitializer {
  /**
   * Initializes a new Local Loader Initializer instance with the provided configuration.
   */
  constructor(service) {
    this.service = service;
    this.config = service.config;
  }

  /**
   * Executes the Local Loader Initializer run lifecycle.
   */
  run() {
    this.service.overrides = this.config.dependencies || {};
    this._validateRegistry();
    this._initRenderer();
    this._loadDependencies();
    this._wireLogging();
    this._wireCompilers();
    this._wireLocalHelpers();
    this._setupRequireBuilder();
    this._registerService();
  }

  /**
   * Performs the internal validate registry step for Local Loader Initializer.
   */
  _validateRegistry() {
    this.service.serviceRegistry = this.config.serviceRegistry;
    if (!this.service.serviceRegistry) {
      throw new Error("ServiceRegistry required for LocalLoaderService");
    }
  }

  /**
   * Performs the internal init renderer step for Local Loader Initializer.
   */
  _initRenderer() {
    const FrameworkRenderer = LocalLoaderService.helperRegistry.getHelper("frameworkRenderer");
    if (!FrameworkRenderer) {
      throw new Error("FrameworkRenderer helper missing from helper registry");
    }
    const rendererConfig = new FrameworkRenderer.Config({
      document: this.config.document,
    });
    this.service.frameworkRenderer = new FrameworkRenderer(rendererConfig);
    this.service.frameworkRenderer.initialize();
    this.service.namespace = this.config.namespace || {};
    this.service.helpers = this.service.namespace.helpers || (this.service.namespace.helpers = {});
    this.service.isCommonJs = typeof module !== "undefined" && module.exports;
  }

  /**
   * Performs the internal load dependencies step for Local Loader Initializer.
   */
  _loadDependencies() {
    const loader = new LocalLoaderService.dependencyLoader(
      new LocalDependencyLoaderConfig({
        overrides: this.service.overrides,
        helpers: this.service.helpers,
        helperRegistry: LocalLoaderService.helperRegistry,
        isCommonJs: this.service.isCommonJs,
      })
    );
    Object.assign(this.service, loader.initialize(this.service.serviceRegistry));
  }

  /**
   * Performs the internal wire logging step for Local Loader Initializer.
   */
  _wireLogging() {
    const s = this.service;
    s.logClient = (s.logging && s.logging.logClient) || (() => {});
    s.loadDynamicModule =
      (s.dynamicModules && s.dynamicModules.loadDynamicModule) ||
      (() => Promise.reject(new Error("dynamic loader missing")));
  }

  /**
   * Performs the internal wire compilers step for Local Loader Initializer.
   */
  _wireCompilers() {
    const s = this.service;
    s.compileSCSS = s.sassCompiler?.compileSCSS;
    s.injectCSS = s.sassCompiler?.injectCSS;
    s.compileTSX = s.tsxCompiler?.compileTSX;
    s.transformSource = s.tsxCompiler?.transformSource;
    s.executeModuleSource = s.tsxCompiler?.executeModuleSource;
  }

  /**
   * Performs the internal wire local helpers step for Local Loader Initializer.
   */
  _wireLocalHelpers() {
    const s = this.service;
    s.isLocalModule = s.localPaths?.isLocalModule;
    s.normalizeDir = s.localPaths?.normalizeDir;
    s.makeAliasKey = s.localPaths?.makeAliasKey;
    s.getModuleDir = s.localPaths?.getModuleDir;
    s.localModuleLoader = s.moduleLoader?.createLocalModuleLoader;
    s.fetchLocalModuleSource = s.moduleLoader?.fetchLocalModuleSource;
  }

  /**
   * Performs the internal setup require builder step for Local Loader Initializer.
   */
  _setupRequireBuilder() {
    const LocalRequireBuilder = LocalLoaderService.helperRegistry.getHelper("localRequireBuilder");
    if (!LocalRequireBuilder) {
      throw new Error("LocalRequireBuilder helper missing from helper registry");
    }
    const builder = new LocalRequireBuilder(
      new LocalRequireBuilder.Config({
        helperRegistry: LocalLoaderService.helperRegistry,
      })
    );
    builder.initialize({
      loadDynamicModule: this.service.loadDynamicModule,
      isLocalModule: this.service.isLocalModule,
    });
    this.service.requireBuilder = builder;
  }

  /**
   * Performs the internal register service step for Local Loader Initializer.
   */
  _registerService() {
    this.service.serviceRegistry.register("localLoader", this.service.exports, {
      folder: "services/local",
      domain: "local",
    });
  }
}

/**
 * Combines sass/tsx/local helpers into the shared local loader surface.
 */
class LocalLoaderService extends BaseService {
  static helperRegistry = require("./helpers");
  static dependencyLoader = require("./local-dependency-loader.js");

  constructor(config = new LocalLoaderConfig()) { super(config); }

  /**
   * Sets up the Local Loader Service instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    new LocalLoaderInitializer(this).run();
    return this;
  }

  /**
   * Renders the framework renderer output for Local Loader Service.
   */
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

  /**
   * Exposes the public Local Loader Service API.
   */
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

  /**
   * Registers Local Loader Service with the runtime service registry.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.localLoader = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
    return this;
  }
}

module.exports = LocalLoaderService;
