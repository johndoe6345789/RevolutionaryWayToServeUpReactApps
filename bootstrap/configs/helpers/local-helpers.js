/**
 * Config for the LocalHelpers helper.
 */
class LocalHelpersConfig {
  /**
   * Initializes a new Local Helpers Config instance with the provided configuration.
   */
  constructor({ helperRegistry } = {}) {
    this.helperRegistry = helperRegistry;
  }
}

module.exports = LocalHelpersConfig;
