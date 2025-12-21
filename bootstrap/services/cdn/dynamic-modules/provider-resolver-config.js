/**
 * Configuration for the provider resolver helper.
 */
const HelperRegistry = require("../../helpers/helper-registry.js");

/**
 * Configuration for the provider resolver helper.
 */
class ProviderResolverConfig {
  /**
   * Initializes a new Provider Resolver Config instance with the provided configuration.
   */
  constructor({ service, helperRegistry } = {}) {
    this.service = service;
    this.helperRegistry = helperRegistry;
  }
}

module.exports = ProviderResolverConfig;
