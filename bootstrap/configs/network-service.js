/**
 * Configuration bag for wiring network service dependencies such as logging and wait helpers.
 */
class NetworkServiceConfig {
  /**
   * Initializes a new Network Service Config instance with the provided configuration.
   */
  constructor({ logClient, wait, namespace } = {}) {
    this.logClient = logClient;
    this.wait = wait;
    this.namespace = namespace;
  }
}

module.exports = NetworkServiceConfig;
