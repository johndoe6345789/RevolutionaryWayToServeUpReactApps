const BaseService = require("../base-service.js");
const ModuleLoaderConfig = require("../../configs/core/module-loader.js");
const ModuleLoaderEnvironment = require("./module-loader-environment.js");

/**
 * Aggregates the CDN/local helpers and exposes the module loader façade.
 */
class ModuleLoaderAggregator extends BaseService {
  constructor(config = new ModuleLoaderConfig()) {
    super(config);
  }

  /**
   * Sets up the Module Loader Aggregator instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    const root = this.config.environmentRoot;
    if (!root) {
      throw new Error("Environment root required for ModuleLoaderAggregator");
    }
    this.environment = new ModuleLoaderEnvironment(root);
    this.global = this.environment.global;
    this.helpers = this.environment.helpers;
    this.isCommonJs = this.environment.isCommonJs;
    this.dependencies = this.config.dependencies || {};
    this._loadDependencies();
    this._buildExports();
    this._registerWithServiceRegistry();
    this._markInitialized();
    return this;
  }

  /**
   * Performs the internal load dependencies step for Module Loader Aggregator.
   */
  _loadDependencies() {
    this.network = this._requireOrHelper("../../cdn/network.js", "network");
    this.tools = this._requireOrHelper("../../cdn/tools.js", "tools");
    this.dynamicModules = this._requireOrHelper(
      "../../cdn/dynamic-modules.js",
      "dynamicModules"
    );
    this.sourceUtils = this._requireOrHelper(
      "../../cdn/source-utils.js",
      "sourceUtils"
    );
    this.localLoader = this._requireOrHelper(
      "../../initializers/loaders/local-loader.js",
      "localLoader"
    );
  }

  /**
   * Performs the internal build exports step for Module Loader Aggregator.
   */
  _buildExports() {
    this.exports = Object.assign(
      {},
      this.network,
      this.tools,
      this.dynamicModules,
      this.sourceUtils,
      this.localLoader
    );
  }

  /**
   * Performs the internal register with service registry step for Module Loader Aggregator.
   */
  _registerWithServiceRegistry() {
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for ModuleLoaderAggregator");
    }
    this.serviceRegistry.register("moduleLoader", this.exports, {
      folder: "services/core",
      domain: "core",
    }, ["logging", "tools", "dynamicModules", "sourceUtils"]);
  }

  /**
   * Performs the internal require or helper step for Module Loader Aggregator.
   */
  _requireOrHelper(path, helperKey) {
    if (this.isCommonJs) {
      return require(path);
    }
    return this.dependencies[helperKey] || this.helpers[helperKey] || {};
  }

  /**
   * Registers Module Loader Aggregator with the runtime service registry.
   */
  install() {
    this._ensureInitialized();
    this.helpers.moduleLoader = this.exports;
    if (this.isCommonJs) {
      module.exports = this.exports;
    }
    return this;
  }
}

module.exports = ModuleLoaderAggregator;
