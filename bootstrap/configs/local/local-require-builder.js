/**
 * Config for the LocalRequireBuilder helper.
 */
class LocalRequireBuilderConfig {
  /**
   * Initializes a new Local Require Builder Config instance with the provided configuration.
   */
  constructor({ helperRegistry } = {}) {
    this.helperRegistry = helperRegistry;
  }
}

module.exports = LocalRequireBuilderConfig;
