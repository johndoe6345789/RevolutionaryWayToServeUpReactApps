const BaseService = require("../../interfaces/base-service.js");
const NetworkServiceConfig = require("../../configs/cdn/network-service.js");
const NetworkProviderServiceConfig = require("../../configs/cdn/network-provider-service.js");
const NetworkProbeServiceConfig = require("../../configs/cdn/network-probe-service.js");
const NetworkModuleResolverConfig = require("../../configs/cdn/network-module-resolver.js");
const NetworkProviderService = require("./network/network-provider-service.js");
const NetworkProbeService = require("./network/network-probe-service.js");
const NetworkModuleResolver = require("./network/network-module-resolver.js");

class NetworkService extends BaseService {
  constructor(config = new NetworkServiceConfig()) {
    super(config);
  }

  initialize() {
    this._ensureNotInitialized();
    this._prepareContext();
    this._initializeServices();
    this._bindExports();
    this._markInitialized();
    return this;
  }

  _prepareContext() {
    const namespace = this.config.namespace || {};
    this.namespace = namespace;
    this.helpers = namespace.helpers || (namespace.helpers = {});
    this.isCommonJs = this.config.isCommonJs;
    this.logClient = this.config.logClient ?? (() => {});
    this.wait = this.config.wait ?? (() => Promise.resolve());
  }

  _initializeServices() {
    this._initializeProviderService();
    this._initializeProbeService();
    this._initializeModuleResolver();
  }

  _initializeProviderService() {
    const providerConfig = new NetworkProviderServiceConfig({
      ...(this.config.providerConfig || {}),
    });
    this.providerService = new NetworkProviderService(providerConfig).initialize();
  }

  _initializeProbeService() {
    const probeConfig = new NetworkProbeServiceConfig({
      logClient: this.logClient,
      wait: this.wait,
      ...(this.config.probeConfig || {}),
    });
    this.probeService = new NetworkProbeService(probeConfig).initialize();
  }

  _initializeModuleResolver() {
    const resolverConfig = new NetworkModuleResolverConfig({
      providerService: this.providerService,
      probeService: this.probeService,
      logClient: this.logClient,
      ...(this.config.moduleResolverConfig || {}),
    });
    this.moduleResolver = new NetworkModuleResolver(resolverConfig).initialize();
  }

  _bindExports() {
    this.setFallbackProviders = this.providerService.setFallbackProviders.bind(
      this.providerService
    );
    this.getFallbackProviders = this.providerService.getFallbackProviders.bind(
      this.providerService
    );
    this.setDefaultProviderBase =
      this.providerService.setDefaultProviderBase.bind(this.providerService);
    this.getDefaultProviderBase =
      this.providerService.getDefaultProviderBase.bind(this.providerService);
    this.setProviderAliases = this.providerService.setProviderAliases.bind(
      this.providerService
    );
    this.normalizeProxyMode =
      this.providerService.normalizeProxyMode.bind(this.providerService);
    this.getProxyMode = this.providerService.getProxyMode.bind(this.providerService);
    this.isCiLikeHost = this.providerService.isCiLikeHost.bind(this.providerService);
    this.normalizeProviderBase =
      this.providerService.normalizeProviderBase.bind(this.providerService);
    this.normalizeProviderBaseRaw =
      this.providerService.normalizeProviderBaseRaw.bind(this.providerService);
    this.resolveProvider = this.providerService.resolveProvider.bind(this.providerService);

    this.loadScript = this.probeService.loadScript.bind(this.probeService);
    this.shouldRetryStatus =
      this.probeService.shouldRetryStatus.bind(this.probeService);
    this.probeUrl = this.probeService.probeUrl.bind(this.probeService);

    this.resolveModuleUrl =
      this.moduleResolver.resolveModuleUrl.bind(this.moduleResolver);
  }
}

module.exports = NetworkService;
