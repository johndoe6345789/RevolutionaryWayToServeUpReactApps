/**
 * Configures the dynamic module fetcher helper.
 */
const HelperRegistry = require("../../../helpers/helper-registry.js");

/**
 * Configures the dynamic module fetcher helper.
 */
class DynamicModuleFetcherConfig {
  /**
   * Initializes a new Dynamic Module Fetcher Config instance with the provided configuration.
   */
  constructor({ service, helperRegistry } = {}) {
    this.service = service;
    this.helperRegistry = helperRegistry;
  }
}

module.exports = DynamicModuleFetcherConfig;

module.exports = DynamicModuleFetcherConfig;
