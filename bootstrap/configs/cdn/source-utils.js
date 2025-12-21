/**
 * Extensible hooks for parsing and preloading source modules.
 */
class SourceUtilsConfig {
  /**
   * Initializes a new Source Utils Config instance with the provided configuration.
   */
  constructor({ serviceRegistry, namespace } = {}) {
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = SourceUtilsConfig;
