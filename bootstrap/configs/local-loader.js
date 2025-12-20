/**
 * Aggregates dependency overrides for the local loader surface.
 */
class LocalLoaderConfig {
  constructor({ dependencies, serviceRegistry } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LocalLoaderConfig;
