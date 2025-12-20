const globalRoot = require("../../constants/global-root.js");
const EnvInitializerConfig = require("../../configs/env.js");

/**
 * Ensures the runtime proxy-mode flag is always defined.
 */
class EnvInitializer {
  constructor(config = new EnvInitializerConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("EnvInitializer already initialized");
    }
    this.initialized = true;
    this.global = this.config.global || globalRoot;
    this.ensureProxyMode();
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for EnvInitializer");
    }
    this.serviceRegistry.register("env", this, {
      folder: "services/core",
      domain: "core",
    });
  }

  ensureProxyMode() {
    if (typeof this.global.__RWTRA_PROXY_MODE__ === "undefined") {
      this.global.__RWTRA_PROXY_MODE__ = "auto";
    }
  }
}

module.exports = EnvInitializer;
