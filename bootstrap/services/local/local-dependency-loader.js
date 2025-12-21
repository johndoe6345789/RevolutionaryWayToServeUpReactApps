/**
 * Resolves the LocalLoaderService dependencies via overrides, helpers, or CommonJS fallbacks.
 */
const LocalDependencyLoaderConfig = require("../../configs/local-dependency-loader.js");

class LocalDependencyLoader {
  constructor(config = new LocalDependencyLoaderConfig()) {
    this.config = config;
  }

  /**
   * Sets up the Local Dependency Loader instance before it handles requests.
   */
  initialize(serviceRegistry) {
    if (this.initialized) {
      throw new Error("LocalDependencyLoader already initialized");
    }
    this.dependencies = null;
    const dependencies = {};
    for (const descriptor of this._dependencyDescriptors()) {
      dependencies[descriptor.name] = this._resolve(descriptor, serviceRegistry);
    }
    Object.assign(this.config.helpers, dependencies);
    this.dependencies = dependencies;
    this.initialized = true;
    const registry = this.config.helperRegistry;
    if (registry && !registry.isRegistered("localDependencyLoader")) {
      registry.register("localDependencyLoader", this, {
        folder: "services/local",
        domain: "local",
      });
    }
    return dependencies;
  }

  /**
   * Resolves dependency descriptors for Local Dependency Loader.
   */
  _dependencyDescriptors() {
    return [
      { name: "logging", fallback: "../../cdn/logging.js", helper: "logging" },
      {
        name: "dynamicModules",
        fallback: "../../cdn/dynamic-modules.js",
        helper: "dynamicModules",
      },
      {
        name: "sassCompiler",
        fallback: "../../initializers/compilers/sass-compiler.js",
        helper: "sassCompiler",
      },
      {
        name: "tsxCompiler",
        fallback: "../../initializers/compilers/tsx-compiler.js",
        helper: "tsxCompiler",
      },
      {
        name: "localPaths",
        fallback: "../../initializers/path-utils/local-paths.js",
        helper: "localPaths",
      },
      {
        name: "localModuleLoader",
        fallback: "../../initializers/loaders/local-module-loader.js",
        helper: "localModuleLoader",
      },
    ];
  }

  /**
   * Resolves dependencies for Local Dependency Loader from configured locations.
   */
  _resolve(descriptor, serviceRegistry) {
    const { overrides, helperRegistry, isCommonJs, helpers } = this.config;
    const { name, fallback, helper } = descriptor;
    if (Object.prototype.hasOwnProperty.call(overrides, name)) {
      return overrides[name];
    }
    const service = serviceRegistry?.getService(name);
    if (service) {
      return service;
    }
    if (isCommonJs) {
      return require(fallback);
    }
    return helpers[helper] || helperRegistry?.getHelper(helper) || {};
  }

}

module.exports = LocalDependencyLoader;
