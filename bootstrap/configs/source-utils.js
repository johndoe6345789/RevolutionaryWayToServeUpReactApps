/**
 * Extensible hooks for parsing and preloading source modules.
 */
class SourceUtilsConfig {
  constructor({ serviceRegistry, namespace } = {}) {
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = SourceUtilsConfig;
