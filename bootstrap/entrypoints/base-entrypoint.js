const serviceRegistry = require("../services/service-registry-instance.js");
const entrypointRegistry = require("../registries/entrypoint-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

/**
 * Consolidates the repetitive entrypoint wiring for bootstrap services/helpers.
 */
class BaseEntryPoint {
  constructor({ ServiceClass, ConfigClass, configFactory = () => ({}) }) {
    this.ServiceClass = ServiceClass;
    this.ConfigClass = ConfigClass;
    this.configFactory = configFactory;
    this.rootHandler = new GlobalRootHandler();
  }

  /**
   * Performs the internal create config step for Base Entry Point.
   */
  _createConfig() {
    const overrides = this.configFactory({
      serviceRegistry,
      entrypointRegistry,
      root: this.rootHandler.root,
      namespace: this.rootHandler.getNamespace(),
      document: this.rootHandler.getDocument(),
    });
    return new this.ConfigClass({
      serviceRegistry,
      entrypointRegistry,
      ...overrides,
    });
  }

  /**
   * Instantiates the wrapped service/config, calls initialize/install, and returns the service instance.
   */
  run() {
    const service = new this.ServiceClass(this._createConfig());
    service.initialize();
    if (typeof service.install === "function") {
      service.install();
    }
    return service;
  }
}

module.exports = BaseEntryPoint;
