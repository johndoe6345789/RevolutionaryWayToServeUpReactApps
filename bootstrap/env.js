const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;

const EnvInitializerConfig = require("./configs/env.js");

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

const envInitializer = new EnvInitializer();
envInitializer.initialize();
