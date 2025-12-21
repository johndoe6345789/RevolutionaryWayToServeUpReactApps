const BaseService = require("../../../interfaces/base-service.js");
const NetworkProviderServiceConfig = require("../../../configs/cdn/network-provider-service.js");
const {
  normalizeProviderBaseRawValue,
  createAliasMap,
} = require("./provider-utils.js");

class NetworkProviderService extends BaseService {
  constructor(config = new NetworkProviderServiceConfig()) {
    super(config);
  }
  initialize() {
    this._ensureNotInitialized();
    this._applyConfig();
    this._markInitialized();
    return this;
  }
  _applyConfig() {
    const config = this.config;
    this.globalObject = config.globalObject;
    this.defaultFallbackProviders = [...config.defaultFallbackProviders];
    this.fallbackProviders = [...config.fallbackProviders];
    this.defaultProviderBase = config.defaultProviderBase;
    this.defaultProviderAliases = config.defaultProviderAliases || {};
    this.providerAliases = createAliasMap(this.defaultProviderAliases);
    this.proxyModeAuto = config.proxyModeAuto;
    this.proxyModeProxy = config.proxyModeProxy;
    this.proxyModeDirect = config.proxyModeDirect;
  }
  setFallbackProviders(providers) {
    if (!Array.isArray(providers) || !providers.length) {
      this.fallbackProviders = [...this.defaultFallbackProviders];
      return;
    }
    this.fallbackProviders = providers
      .map((provider) => this.normalizeProviderBase(provider))
      .filter(Boolean);
    if (!this.fallbackProviders.length) {
      this.fallbackProviders = [...this.defaultFallbackProviders];
    }
  }
  getFallbackProviders() {
    return [...this.fallbackProviders];
  }
  setDefaultProviderBase(provider) {
    this.defaultProviderBase = normalizeProviderBaseRawValue(provider);
  }

  getDefaultProviderBase() {
    return this.defaultProviderBase;
  }

  setProviderAliases(aliases) {
    this.providerAliases = createAliasMap({
      ...this.defaultProviderAliases,
      ...aliases,
    });
  }

  normalizeProxyMode(mode) {
    if (!mode) return this.proxyModeAuto;
    const normalized = String(mode).trim().toLowerCase();
    return normalized === this.proxyModeProxy || normalized === this.proxyModeDirect
      ? normalized
      : this.proxyModeAuto;
  }

  getProxyMode() {
    const globalMode = this.normalizeProxyMode(
      this.globalObject.__RWTRA_PROXY_MODE__
    );
    if (globalMode !== this.proxyModeAuto) {
      return globalMode;
    }
    try {
      const envMode = this.normalizeProxyMode(
        typeof this.globalObject.process !== "undefined" &&
          this.globalObject.process.env &&
          this.globalObject.process.env.RWTRA_PROXY_MODE
      );
      if (envMode !== this.proxyModeAuto) {
        return envMode;
      }
    } catch (_err) {
      // Accessing process.env can fail in some sandboxed environments; default to auto.
    }
    return this.proxyModeAuto;
  }

  isCiLikeHost() {
    if (typeof this.globalObject.window === "undefined") return false;
    const host =
      this.globalObject.window.location && this.globalObject.window.location.hostname;
    return host === "127.0.0.1" || host === "localhost";
  }

  normalizeProviderBase(provider) {
    if (!provider) return "";
    const alias = this.providerAliases.get(provider);
    if (alias) return alias;
    return normalizeProviderBaseRawValue(provider);
  }

  normalizeProviderBaseRaw(provider) {
    return normalizeProviderBaseRawValue(provider);
  }

  resolveProvider(mod) {
    const hasDualProviders = mod.ci_provider || mod.production_provider;
    if (hasDualProviders) {
      const proxyMode = this.getProxyMode();
      const preferProxy =
        proxyMode === this.proxyModeProxy ||
        (proxyMode === this.proxyModeAuto && this.isCiLikeHost());
      return preferProxy
        ? mod.ci_provider || mod.production_provider
        : mod.production_provider || mod.ci_provider;
    }
    return (
      mod.provider ||
      mod.ci_provider ||
      mod.production_provider ||
      this.defaultProviderBase ||
      ""
    );
  }

  collectBases(mod) {
    const bases = [];
    const addBase = (b) => {
      if (!b) return;
      const normalized = this.normalizeProviderBase(b);
      if (!bases.includes(normalized)) bases.push(normalized);
    };

    addBase(this.resolveProvider(mod));
    addBase(mod.provider);
    addBase(mod.ci_provider);
    addBase(mod.production_provider);
    if (mod.allowJsDelivr !== false) {
      for (const fallback of this.fallbackProviders) {
        addBase(fallback);
      }
    }
    return bases;
  }
}

module.exports = NetworkProviderService;
