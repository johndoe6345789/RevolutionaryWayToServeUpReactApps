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
  }

  ensureProxyMode() {
    if (typeof this.global.__RWTRA_PROXY_MODE__ === "undefined") {
      this.global.__RWTRA_PROXY_MODE__ = "auto";
    }
  }
}

module.exports = EnvInitializer;
