const BaseService = require("../base-service.js");
const LocalLoaderConfig = require("../../configs/local-loader.js");

const LocalDependencyLoaderConfig = require("../../configs/local-dependency-loader.js");

class LocalLoaderInitializer {
  constructor(service) {
    this.service = service;
    this.config = service.config;
  }

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

  _validateRegistry() {
    this.service.serviceRegistry = this.config.serviceRegistry;
    if (!this.service.serviceRegistry) {
      throw new Error("ServiceRegistry required for LocalLoaderService");
    }
  }

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

  _wireLogging() {
    const s = this.service;
    s.logClient = (s.logging && s.logging.logClient) || (() => {});
    s.loadDynamicModule =
      (s.dynamicModules && s.dynamicModules.loadDynamicModule) ||
      (() => Promise.reject(new Error("dynamic loader missing")));
  }

  _wireCompilers() {
    const s = this.service;
    s.compileSCSS = s.sassCompiler?.compileSCSS;
    s.injectCSS = s.sassCompiler?.injectCSS;
    s.compileTSX = s.tsxCompiler?.compileTSX;
    s.transformSource = s.tsxCompiler?.transformSource;
    s.executeModuleSource = s.tsxCompiler?.executeModuleSource;
  }

  _wireLocalHelpers() {
    const s = this.service;
    s.isLocalModule = s.localPaths?.isLocalModule;
    s.normalizeDir = s.localPaths?.normalizeDir;
    s.makeAliasKey = s.localPaths?.makeAliasKey;
    s.getModuleDir = s.localPaths?.getModuleDir;
    s.localModuleLoader = s.moduleLoader?.createLocalModuleLoader;
    s.fetchLocalModuleSource = s.moduleLoader?.fetchLocalModuleSource;
  }

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

  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    new LocalLoaderInitializer(this).run();
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
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.localLoader = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

module.exports = LocalLoaderService;
