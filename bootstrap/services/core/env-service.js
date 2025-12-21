const BaseService = require("../base-service.js");
const EnvInitializerConfig = require("../../configs/core/env.js");

/**
 * Ensures the runtime proxy-mode flag is always defined.
 */
class EnvInitializer extends BaseService {
  constructor(config = new EnvInitializerConfig()) {
    super(config);
  }

  /**
   * Sets up the Env Initializer instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    this.global = this.config.global;
    if (!this.global) {
      throw new Error("Global object required for EnvInitializer");
    }
    this.ensureProxyMode();
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for EnvInitializer");
    }
    this.serviceRegistry.register("env", this, {
      folder: "services/core",
      domain: "core",
    }, []);
    this._markInitialized();
    return this;
  }

  /**
   * Ensure Proxy Mode for Env Initializer.
   */
  ensureProxyMode() {
    if (typeof this.global.__RWTRA_PROXY_MODE__ === "undefined") {
      this.global.__RWTRA_PROXY_MODE__ = "auto";
    }
  }
}

module.exports = EnvInitializer;
