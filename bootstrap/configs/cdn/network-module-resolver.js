/**
 * Configuration bag for module URL resolution helpers.
 */
class NetworkModuleResolverConfig {
  /**
   * Initializes a new Network Module Resolver Config instance with the provided configuration.
   */
  constructor({ providerService, probeService, logClient } = {}) {
    this.providerService = providerService;
    this.probeService = probeService;
    this.logClient = logClient ?? (() => {});
  }
}

module.exports = NetworkModuleResolverConfig;
