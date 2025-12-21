const EnvInitializerConfig = require("../../configs/env.js");

/**
 * Ensures the runtime proxy-mode flag is always defined.
 */
class EnvInitializer {
  constructor(config = new EnvInitializerConfig()) { this.config = config; }

  /**
   * Sets up the Env Initializer instance before it handles requests.
   */
  initialize() {
    if (this.initialized) {
      throw new Error("EnvInitializer already initialized");
    }
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
    });
    this.initialized = true;
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
