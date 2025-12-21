/**
 * Configuration for ModuleLoaderEnvironment.
 */
class ModuleLoaderEnvironmentConfig {
  /**
   * Initializes a new Module Loader Environment Config instance with the provided configuration.
   */
  constructor({ root } = {}) {
    this.root = root;
  }
}

module.exports = ModuleLoaderEnvironmentConfig;