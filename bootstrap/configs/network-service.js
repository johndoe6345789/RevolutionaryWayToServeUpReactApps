/**
 * Configuration bag for wiring network service dependencies such as logging and wait helpers.
 */
class NetworkServiceConfig {
  constructor({ logClient, wait } = {}) {
    this.logClient = logClient;
    this.wait = wait;
  }
}

module.exports = NetworkServiceConfig;
