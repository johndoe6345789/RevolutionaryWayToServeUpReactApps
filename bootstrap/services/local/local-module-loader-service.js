const BaseService = require("../base-service.js");
const LocalModuleLoaderConfig = require("../../configs/local-module-loader.js");

/**
 * Provides asynchronous loading for local modules and caches their exports.
 */
class LocalModuleLoaderService extends BaseService {
  constructor(config = new LocalModuleLoaderConfig()) { super(config); }

  /**
   * Sets up the Local Module Loader Service instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    const dependencies = this.config.dependencies || {};
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.serviceRegistry = this._requireServiceRegistry();
    this.logging =
      dependencies.logging ?? (this.isCommonJs ? require("../../cdn/logging.js") : this.helpers.logging);
    this.dynamicModules =
      dependencies.dynamicModules ?? (this.isCommonJs ? require("../../cdn/dynamic-modules.js") : this.helpers.dynamicModules);
    this.sourceUtils =
      dependencies.sourceUtils ?? (this.isCommonJs ? require("../../cdn/source-utils.js") : this.helpers.sourceUtils);
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
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadDynamicModule =
      (this.dynamicModules && this.dynamicModules.loadDynamicModule) ||
      (() => Promise.reject(new Error("dynamic loader missing")));
    this.preloadModulesFromSource = this.sourceUtils?.preloadModulesFromSource;
    this.executeModuleSource = this.tsxCompiler?.executeModuleSource;
    this.transformSource = this.tsxCompiler?.transformSource;
    this.normalizeDir = this.localPaths?.normalizeDir;
    this.makeAliasKey = this.localPaths?.makeAliasKey;
    this.resolveLocalModuleBase = this.localPaths?.resolveLocalModuleBase;
    this.getModuleDir = this.localPaths?.getModuleDir;
    this.getCandidateLocalPaths = this.localPaths?.getCandidateLocalPaths;
    this.fetchImpl = this.config.fetch ?? dependencies.fetch;
    return this;
  }

  /**
   * Creates the local module loader for Local Module Loader Service.
   */
  createLocalModuleLoader(entryDir) {
    const moduleCache = new Map();
    const modulePromises = new Map();
    const aliasToCanonical = new Map();
    const normalizedEntryDir = entryDir || "";

    return async (name, baseDir, requireFn, registry) => {
      const normalizedBase = this.normalizeDir
        ? this.normalizeDir(baseDir || normalizedEntryDir)
        : baseDir || normalizedEntryDir || "";
      const aliasKey = this.makeAliasKey
        ? this.makeAliasKey(name, normalizedBase)
        : name;
      const existingCanonical = aliasToCanonical.get(aliasKey);

      if (existingCanonical && registry[existingCanonical]) {
        const cached = registry[existingCanonical];
        registry[name] = cached;
        return cached;
      }

      const basePath = this.resolveLocalModuleBase
        ? this.resolveLocalModuleBase(name, normalizedBase)
        : name;
      const { source, resolvedPath } = await this.fetchLocalModuleSource(basePath);
      const moduleDir = this.getModuleDir ? this.getModuleDir(resolvedPath) : "";
      aliasToCanonical.set(aliasKey, resolvedPath);

      if (moduleCache.has(resolvedPath)) {
        const cached = moduleCache.get(resolvedPath);
        registry[resolvedPath] = cached;
        registry[name] = cached;
        return cached;
      }

      if (modulePromises.has(resolvedPath)) {
        const pending = await modulePromises.get(resolvedPath);
        registry[resolvedPath] = pending;
        registry[name] = pending;
        return pending;
      }

      const loadPromise = (async () => {
        if (this.preloadModulesFromSource) {
          await this.preloadModulesFromSource(source, requireFn, moduleDir);
        }
        if (!this.executeModuleSource) {
          throw new Error("TSX compiler executeModuleSource missing");
        }
        const moduleExports = this.executeModuleSource(
          source,
          resolvedPath,
          moduleDir,
          requireFn
        );
        moduleCache.set(resolvedPath, moduleExports);
        registry[resolvedPath] = moduleExports;
        return moduleExports;
      })();

      modulePromises.set(resolvedPath, loadPromise);
      try {
        const result = await loadPromise;
        registry[name] = result;
        return result;
      } finally {
        modulePromises.delete(resolvedPath);
      }
    };
  }

  /**
   * Ensures the namespace value is resolved for Local Module Loader Service.
   */
  _resolveNamespace() {
    return super._resolveNamespace();
  }

  /**
   * Fetches local module source code for Local Module Loader Service.
   */
  async fetchLocalModuleSource(basePath) {
    if (!this.fetchImpl) {
      throw new Error("Fetch unavailable for local modules");
    }
    const candidates = this.getCandidateLocalPaths
      ? this.getCandidateLocalPaths(basePath)
      : [basePath];

    for (const candidate of candidates) {
      try {
        const res = await this.fetchImpl(candidate, { cache: "no-store" });
        if (res.ok) {
          return {
            source: await res.text(),
            resolvedPath: candidate,
          };
        }
      } catch (_err) {
        // ignore and try next candidate
      }
    }

    this.logClient("local-module:failed", { basePath, candidates });
    throw new Error(
      "Failed to load local module: " +
        basePath +
        " (tried: " +
        candidates.join(", ") +
        ")"
    );
  }

  /**
   * Exposes the public Local Module Loader Service API.
   */
  get exports() {
    return {
      createLocalModuleLoader: this.createLocalModuleLoader.bind(this),
      fetchLocalModuleSource: this.fetchLocalModuleSource.bind(this),
    };
  }

  /**
   * Registers Local Module Loader Service with the runtime service registry.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.localModuleLoader = exports;
    this.serviceRegistry.register("localModuleLoader", exports, {
      folder: "services/local",
      domain: "local",
    });
    if (this.isCommonJs) {
      module.exports = exports;
    }
    return this;
  }
}

module.exports = LocalModuleLoaderService;
