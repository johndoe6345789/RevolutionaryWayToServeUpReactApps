const ModuleLoaderConfig = require("../../configs/module-loader.js");
const globalRoot = require("../../constants/global-root.js");

/**
 * Aggregates the CDN/local helpers and exposes the module loader façade.
 */
class ModuleLoaderAggregator {
  constructor(config = new ModuleLoaderConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("ModuleLoaderAggregator already initialized");
    }
    this.initialized = true;
    this.global = globalRoot;
    this.namespace = this.global.__rwtraBootstrap || (this.global.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.dependencies = this.config.dependencies || {};
    this._loadDependencies();
    this.exports = Object.assign(
      {},
      this.network,
      this.tools,
      this.dynamicModules,
      this.sourceUtils,
      this.localLoader
    );
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for ModuleLoaderAggregator");
    }
    this.serviceRegistry.register("moduleLoader", this.exports, {
      folder: "services/core",
      domain: "core",
    });
  }

  _loadDependencies() {
    this.network = this._requireOrHelper("../../cdn/network.js", "network");
    this.tools = this._requireOrHelper("../../cdn/tools.js", "tools");
    this.dynamicModules = this._requireOrHelper("../../cdn/dynamic-modules.js", "dynamicModules");
    this.sourceUtils = this._requireOrHelper("../../cdn/source-utils.js", "sourceUtils");
    this.localLoader = this._requireOrHelper(
      "../../initializers/loaders/local-loader.js",
      "localLoader"
    );
  }

  _requireOrHelper(path, helperKey) {
    if (this.isCommonJs) {
      return require(path);
    }
    return this.dependencies[helperKey] || this.helpers[helperKey] || {};
  }

  install() {
    if (!this.initialized) {
      throw new Error("ModuleLoaderAggregator not initialized");
    }
    this.helpers.moduleLoader = this.exports;
    if (this.isCommonJs) {
      module.exports = this.exports;
    }
  }
}

module.exports = ModuleLoaderAggregator;
