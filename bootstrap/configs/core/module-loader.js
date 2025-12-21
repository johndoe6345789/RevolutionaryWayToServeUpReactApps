/**
 * Defines dependency overrides for the module loader aggregator.
 */
class ModuleLoaderConfig {
  /**
   * Initializes a new Module Loader Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, environmentRoot } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.environmentRoot = environmentRoot;
  }
}

module.exports = ModuleLoaderConfig;
