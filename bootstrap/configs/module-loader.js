/**
 * Defines dependency overrides for the module loader aggregator.
 */
class ModuleLoaderConfig {
  constructor({ dependencies } = {}) {
    this.dependencies = dependencies;
  }
}

module.exports = ModuleLoaderConfig;
