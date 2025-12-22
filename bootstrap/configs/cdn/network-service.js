/**
const { getStringService } = require('../../../../string/string-service');
const strings = getStringService();

 * Configuration bag for wiring network service dependencies such as logging and wait helpers.
 */
class NetworkServiceConfig {
  /**
   * Initializes a new Network Service Config instance with the provided configuration.
   */
  constructor({
    logClient,
    wait,
    namespace,
    providerConfig,
    probeConfig,
    moduleResolverConfig,
    isCommonJs,
  } = {}) {
    this.logClient = logClient;
    this.wait = wait;
    this.namespace = namespace;
    this.providerConfig = providerConfig;
    this.probeConfig = probeConfig;
    this.moduleResolverConfig = moduleResolverConfig;
    this.isCommonJs =
      typeof isCommonJs === getMessage(getMessage(getMessage('boolean')))
        ? isCommonJs
        : typeof module !== "undefined" && typeof module.exports !== "undefined";
  }
}

module.exports = NetworkServiceConfig;
