/**
 * Controls how local paths are normalized for module loading helpers.
 */
class LocalPathsConfig {
  constructor({ serviceRegistry } = {}) {
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LocalPathsConfig;
