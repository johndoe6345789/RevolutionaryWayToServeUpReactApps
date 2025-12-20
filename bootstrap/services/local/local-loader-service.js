const LocalLoaderConfig = require("../../configs/local-loader.js");
const globalRoot = require("../../constants/global-root.js");

/**
 * Combines sass/tsx/local helpers into the shared local loader surface.
 */
class LocalLoaderService {
  constructor(config = new LocalLoaderConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("LocalLoaderService already initialized");
    }
    this.initialized = true;
    const dependencies = this.config.dependencies || {};
    this.global = globalRoot;
    this.namespace = this.global.__rwtraBootstrap || (this.global.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging =
      dependencies.logging ?? (this.isCommonJs ? require("../../cdn/logging.js") : this.helpers.logging);
    this.dynamicModules =
      dependencies.dynamicModules ??
      (this.isCommonJs ? require("../../cdn/dynamic-modules.js") : this.helpers.dynamicModules);
    this.sassCompiler =
      dependencies.sassCompiler ??
      (this.isCommonJs
        ? require("../../initializers/compilers/sass-compiler.js")
        : this.helpers.sassCompiler);
    this.tsxCompiler =
      dependencies.tsxCompiler ??
      (this.isCommonJs
        ? require("../../initializers/compilers/tsx-compiler.js")
        : this.helpers.tsxCompiler);
    this.localPaths =
      dependencies.localPaths ??
      (this.isCommonJs
        ? require("../../initializers/path-utils/local-paths.js")
        : this.helpers.localPaths);
    this.moduleLoader =
      dependencies.moduleLoader ??
      (this.isCommonJs
        ? require("../../initializers/loaders/local-module-loader.js")
        : this.helpers.localModuleLoader);
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
  }

  getModuleExport(mod, name) {
    if (!mod) return null;
    if (Object.prototype.hasOwnProperty.call(mod, name)) {
      return mod[name];
    }
    if (mod.default && Object.prototype.hasOwnProperty.call(mod.default, name)) {
      return mod.default[name];
    }
    return null;
  }

  frameworkRender(config, registry, App) {
    const rootId = config.render?.rootId || "root";
    const rootEl = this.global.document.getElementById(rootId);
    if (!rootEl) throw new Error("Root element not found: #" + rootId);

    const domModuleName = config.render?.domModule;
    const reactModuleName = config.render?.reactModule;
    const domModule = domModuleName ? registry[domModuleName] : null;
    const reactModule = reactModuleName ? registry[reactModuleName] : null;
    if (!domModule) throw new Error("DOM render module missing: " + domModuleName);
    if (!reactModule) throw new Error("React module missing: " + reactModuleName);

    const createRootFn = this.getModuleExport(domModule, config.render.createRoot);
    if (!createRootFn) {
      throw new Error("createRoot not found: " + config.render.createRoot);
    }

    const root = createRootFn(rootEl);
    const renderMethod = config.render.renderMethod || "render";
    if (typeof root[renderMethod] !== "function") {
      throw new Error("Render method not found: " + renderMethod);
    }

    const createElementFn = this.getModuleExport(reactModule, "createElement");
    if (!createElementFn) {
      throw new Error("createElement not found on React module");
    }
    root[renderMethod](createElementFn(App));
  }

  createRequire(
    registry,
    config,
    entryDir = "",
    localModuleLoader,
    dynamicModuleLoader
  ) {
    let resolvedEntryDir = "";
    let resolvedDynamicModuleLoader = dynamicModuleLoader;

    if (typeof entryDir === "function" && arguments.length === 3) {
      resolvedDynamicModuleLoader = entryDir;
    } else {
      resolvedEntryDir = entryDir || "";
    }

    resolvedDynamicModuleLoader = resolvedDynamicModuleLoader || this.loadDynamicModule;

    const requireFn = (name) => {
      if (registry[name]) return registry[name];
      throw new Error(
        "Module not yet loaded: " +
          name +
          " (use a preload step via requireAsync for dynamic modules)"
      );
    };

    const requireAsync = async (name, baseDir) => {
      if (registry[name]) return registry[name];
      if (localModuleLoader && this.isLocalModule && this.isLocalModule(name)) {
        return localModuleLoader(
          name,
          baseDir || resolvedEntryDir,
          requireFn,
          registry
        );
      }
      const dynRules = config.dynamicModules || [];
      if (dynRules.some((r) => name.startsWith(r.prefix))) {
        return resolvedDynamicModuleLoader(name, config, registry);
      }
      throw new Error("Module not registered: " + name);
    };

    requireFn._async = requireAsync;
    return requireFn;
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
