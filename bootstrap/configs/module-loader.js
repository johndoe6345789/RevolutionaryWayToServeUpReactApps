/**
 * Defines dependency overrides for the module loader aggregator.
 */
class ModuleLoaderConfig {
  constructor({ dependencies, serviceRegistry } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = ModuleLoaderConfig;
