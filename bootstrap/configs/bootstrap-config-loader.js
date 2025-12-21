/**
 * Carries optional overrides for how the bootstrap config loader fetches config.json.
 */
class BootstrapConfigLoaderConfig {
  /**
   * Initializes a new Bootstrap Config Loader Config instance with the provided configuration.
   */
  constructor({ fetch } = {}) {
    this.fetch = fetch;
  }
}

module.exports = BootstrapConfigLoaderConfig;
