(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs ? require("./logging.js") : helpers.logging;
  const { logClient = () => {}, wait = () => Promise.resolve() } = logging || {};

  const NetworkService = require("./network-service.js");
  const NetworkServiceConfig = require("../configs/network-service.js");

  const networkService = new NetworkService(
    new NetworkServiceConfig({ logClient, wait })
  );
  networkService.initialize();

  const exports = {
    loadScript: networkService.loadScript,
    normalizeProviderBase: networkService.normalizeProviderBase,
    resolveProvider: networkService.resolveProvider,
    shouldRetryStatus: networkService.shouldRetryStatus,
    probeUrl: networkService.probeUrl,
    resolveModuleUrl: networkService.resolveModuleUrl,
    setFallbackProviders: networkService.setFallbackProviders,
    getFallbackProviders: networkService.getFallbackProviders,
    setDefaultProviderBase: networkService.setDefaultProviderBase,
    getDefaultProviderBase: networkService.getDefaultProviderBase,
    setProviderAliases: networkService.setProviderAliases,
    getProxyMode: networkService.getProxyMode,
    normalizeProviderBaseRaw: networkService.normalizeProviderBaseRaw,
  };

  helpers.network = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
