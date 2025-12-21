/**
 * Configuration for NetworkProbeService instances.
 * Provides network probing and endpoint validation settings.
 */
class NetworkProbeServiceConfig {
  /**
   * Initializes a new Network Probe Service Config instance with the provided configuration.
   */
  constructor({
    timeout = 5000,
    retryAttempts = 3,
    retryDelay = 1000,
    enableHttpsOnly = false,
    userAgent = 'RWTRA-Network-Probe/1.0',
  } = {}) {
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.enableHttpsOnly = enableHttpsOnly;
    this.userAgent = userAgent;
  }
}

module.exports = NetworkProbeServiceConfig;
