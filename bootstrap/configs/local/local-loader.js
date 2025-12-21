/**
 * Aggregates dependency overrides for the local loader surface.
 */
class LocalLoaderConfig {
  /**
   * Initializes a new Local Loader Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, namespace, document } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
    this.document = document;
  }
}

module.exports = LocalLoaderConfig;
