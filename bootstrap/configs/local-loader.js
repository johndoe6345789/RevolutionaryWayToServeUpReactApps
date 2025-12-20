/**
 * Aggregates dependency overrides for the local loader surface.
 */
class LocalLoaderConfig {
  constructor({ dependencies } = {}) {
    this.dependencies = dependencies;
  }
}

module.exports = LocalLoaderConfig;
