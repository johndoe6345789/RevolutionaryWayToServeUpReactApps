/**
 * Extensible hooks for parsing and preloading source modules.
 */
class SourceUtilsConfig {
  constructor({ serviceRegistry } = {}) {
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = SourceUtilsConfig;
