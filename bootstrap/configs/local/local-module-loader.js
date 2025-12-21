/**
 * Supplies overrides needed by the local module loader helpers.
 */
class LocalModuleLoaderConfig {
  /**
   * Initializes a new Local Module Loader Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, namespace, fetch } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
    this.fetch = fetch;
  }
}

module.exports = LocalModuleLoaderConfig;
