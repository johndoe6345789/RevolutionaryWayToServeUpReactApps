const BaseHelper = require("../../interfaces/base-helper.js");
const LocalRequireBuilderConfig = require("../../configs/local/local-require-builder.js");

/**
 * Builds the customized require/_async helpers for local modules.
 */
class LocalRequireBuilder extends BaseHelper {
  constructor(config = new LocalRequireBuilderConfig()) { super(config); }

  /**
   * Sets up the Local Require Builder instance before it handles requests.
   */
  initialize({ loadDynamicModule, isLocalModule }) {
    if (this.initialized) {
      throw new Error("LocalRequireBuilder already initialized");
    }
    this.loadDynamicModule = loadDynamicModule;
    this.isLocalModule = isLocalModule;
    const registry = this.config.helperRegistry;
    if (registry) {
      this._registerHelper("localRequireBuilderInstance", this, {
        folder: "services/local/helpers",
        domain: "helpers",
      });
    }
    this.initialized = true;
    return this;
  }

  create({
    registry,
    config,
    entryDir,
    localModuleLoader,
    dynamicModuleLoader,
    argumentCount = 0,
  }) {
    if (!this.initialized) {
      throw new Error("LocalRequireBuilder not initialized");
    }
    const { resolvedEntryDir, resolvedDynamicModuleLoader } = this._resolveEntryDir(
      entryDir,
      dynamicModuleLoader,
      argumentCount
    );
    const requireFn = this._createRequire(registry);
    const requireAsync = this._createRequireAsync({
      registry,
      config,
      resolvedEntryDir,
      localModuleLoader,
      resolvedDynamicModuleLoader,
      requireFn,
    });
    requireFn._async = requireAsync;
    return requireFn;
  }

  /**
   * Builds the custom require function that Local Require Builder needs.
   */
  _createRequire(registry) {
    return (name) => {
      if (registry[name]) return registry[name];
      throw new Error(
        "Module not yet loaded: " +
          name +
          " (use a preload step via requireAsync for dynamic modules)"
      );
    };
  }

  _createRequireAsync({
    registry,
    config,
    resolvedEntryDir,
    localModuleLoader,
    resolvedDynamicModuleLoader,
    requireFn,
  }) {
    return async (name, baseDir) => {
      if (registry[name]) return registry[name];
      if (localModuleLoader && this._isLocalModule(name)) {
        return localModuleLoader(
          name,
          baseDir || resolvedEntryDir,
          requireFn,
          registry
        );
      }
      const dynRules = (config && config.dynamicModules) || [];
      if (dynRules.some((r) => name.startsWith(r.prefix))) {
        return resolvedDynamicModuleLoader(name, config, registry);
      }
      throw new Error("Module not registered: " + name);
    };
  }

  /**
   * Determines the entry directory of Local Require Builder.
   */
  _resolveEntryDir(entryDir, dynamicModuleLoader, argumentCount) {
    let resolvedEntryDir = "";
    let resolvedDynamicModuleLoader = dynamicModuleLoader;
    if (typeof entryDir === "function" && argumentCount === 3) {
      resolvedDynamicModuleLoader = entryDir;
    } else {
      resolvedEntryDir = entryDir || "";
    }
    resolvedDynamicModuleLoader =
      resolvedDynamicModuleLoader || this.loadDynamicModule;
    return { resolvedEntryDir, resolvedDynamicModuleLoader };
  }

  /**
   * Checks whether a module belongs to the local build for Local Require Builder.
   */
  _isLocalModule(name) {
    return typeof this.isLocalModule === "function" && this.isLocalModule(name);
  }

}

module.exports = LocalRequireBuilder;
LocalRequireBuilder.Config = LocalRequireBuilderConfig;
