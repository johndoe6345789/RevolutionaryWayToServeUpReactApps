/**
 * Carries optional overrides for how the bootstrap config loader fetches config.json.
 */
class BootstrapConfigLoaderConfig {
  constructor({ fetch } = {}) {
    this.fetch = fetch;
  }
}

module.exports = BootstrapConfigLoaderConfig;
