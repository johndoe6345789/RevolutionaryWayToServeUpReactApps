/**
 * Controls how local paths are normalized for module loading helpers.
 */
class LocalPathsConfig {
  /**
   * Initializes a new Local Paths Config instance with the provided configuration.
   */
  constructor({ serviceRegistry, namespace } = {}) {
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = LocalPathsConfig;
