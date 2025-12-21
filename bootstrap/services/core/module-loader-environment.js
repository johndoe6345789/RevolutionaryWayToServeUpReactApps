const ModuleLoaderEnvironmentConfig = require("../../configs/core/module-loader-environment.js");

/**
 * Captures the shared runtime environment bootstrap helpers rely upon.
 */
class ModuleLoaderEnvironment {
  /**
   * Initializes a new Module Loader Environment instance with the provided configuration.
   */
  constructor(config = new ModuleLoaderEnvironmentConfig()) {
    if (!config.root) {
      throw new Error("Root object required for ModuleLoaderEnvironment");
    }
    this.config = config;
    this.global = config.root;
    // Check if __rwtraBootstrap exists and is an object, otherwise create new one
    if (typeof this.global.__rwtraBootstrap !== 'object' || this.global.__rwtraBootstrap === null) {
      this.global.__rwtraBootstrap = {};
    }
    this.namespace = this.global.__rwtraBootstrap;
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && typeof module.exports !== "undefined";
  }
}

module.exports = ModuleLoaderEnvironment;
