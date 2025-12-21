/**
 * Encapsulates the network helper entrypoint so we can reuse the BaseEntryPoint wiring.
 */
const BaseEntryPoint = require("../entrypoints/base-entrypoint.js");
const NetworkService = require("../services/cdn/network-service.js");
const NetworkServiceConfig = require("../configs/network-service.js");

class NetworkEntryPoint extends BaseEntryPoint {
  /**
   * Initializes a new Network Entry Point instance with the provided configuration.
   */
  constructor() {
    super({
      ServiceClass: NetworkService,
      ConfigClass: NetworkServiceConfig,
      configFactory: ({ namespace }) => {
        const helpers = namespace.helpers || (namespace.helpers = {});
        const logging = helpers.logging;
        return {
          logClient: logging?.logClient ?? (() => {}),
          wait: logging?.wait ?? (() => Promise.resolve()),
        };
      },
    });
    this.service = null;
  }

  /**
   * Runs the configured entrypoint and returns the service plus its exports.
   */
  run() {
    this.service = super.run();
    const exports = {
      loadScript: this.service.loadScript,
      normalizeProviderBase: this.service.normalizeProviderBase,
      resolveProvider: this.service.resolveProvider,
      shouldRetryStatus: this.service.shouldRetryStatus,
      probeUrl: this.service.probeUrl,
      resolveModuleUrl: this.service.resolveModuleUrl,
      setFallbackProviders: this.service.setFallbackProviders,
      getFallbackProviders: this.service.getFallbackProviders,
      setDefaultProviderBase: this.service.setDefaultProviderBase,
      getDefaultProviderBase: this.service.getDefaultProviderBase,
      setProviderAliases: this.service.setProviderAliases,
      getProxyMode: this.service.getProxyMode,
      normalizeProviderBaseRaw: this.service.normalizeProviderBaseRaw,
    };
    this.service.helpers.network = exports;
    if (this.service.isCommonJs) {
      module.exports = exports;
    }
    return { service: this.service, exports };
  }
}

module.exports = NetworkEntryPoint;
