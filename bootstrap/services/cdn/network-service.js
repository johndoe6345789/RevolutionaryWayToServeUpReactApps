const globalObject =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};
const isCommonJs = typeof module !== "undefined" && module.exports;
const {
  defaultFallbackProviders: DEFAULT_FALLBACK_PROVIDERS,
  getDefaultProviderAliases,
  proxyModeAuto: PROXY_MODE_AUTO,
  proxyModeProxy: PROXY_MODE_PROXY,
  proxyModeDirect: PROXY_MODE_DIRECT,
} = require("../../constants/common.js");
const DEFAULT_PROVIDER_ALIASES = getDefaultProviderAliases(globalObject, isCommonJs);
const BaseService = require("../base-service.js");
const NetworkServiceConfig = require("../../configs/network-service.js");

/**
 * Normalize Provider Base Raw Value for Network service.
 */
function normalizeProviderBaseRawValue(provider) {
  if (!provider) return "";
  if (provider.startsWith("/")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  if (provider.startsWith("http://") || provider.startsWith("https://")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  return "https://" + provider.replace(/\/+$/, "") + "/";
}

/**
 * Create Alias Map for Network service.
 */
function createAliasMap(source) {
  const map = new Map();
  if (source && typeof source === "object") {
    for (const [alias, value] of Object.entries(source)) {
      if (!alias) continue;
      const normalized = normalizeProviderBaseRawValue(value);
      if (normalized) {
        map.set(alias, normalized);
      }
    }
  }
  return map;
}

/**
 * Performs URL resolution, probing, and provider alias normalization for bootstrap modules.
 */
class NetworkService extends BaseService {
  constructor(config = new NetworkServiceConfig()) { super(config); }

  /**
   * Sets up the Network Service instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    const namespace = this.config.namespace || {};
    this.namespace = namespace;
    this.helpers = namespace.helpers || (namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    const { logClient, wait } = this.config;
    this.logClient = logClient ?? (() => {});
    this.wait = wait ?? (() => Promise.resolve());
    this.fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
    this.defaultProviderBase = "";
    this.providerAliases = createAliasMap(DEFAULT_PROVIDER_ALIASES);
    this.setFallbackProviders = this.setFallbackProviders.bind(this);
    this.getFallbackProviders = this.getFallbackProviders.bind(this);
    this.setDefaultProviderBase = this.setDefaultProviderBase.bind(this);
    this.getDefaultProviderBase = this.getDefaultProviderBase.bind(this);
    this.setProviderAliases = this.setProviderAliases.bind(this);
    this.getProxyMode = this.getProxyMode.bind(this);
    this.loadScript = this.loadScript.bind(this);
    this.normalizeProviderBase = this.normalizeProviderBase.bind(this);
    this.normalizeProviderBaseRaw = this.normalizeProviderBaseRaw.bind(this);
    this.resolveProvider = this.resolveProvider.bind(this);
    this.shouldRetryStatus = this.shouldRetryStatus.bind(this);
    this.probeUrl = this.probeUrl.bind(this);
    this.resolveModuleUrl = this.resolveModuleUrl.bind(this);
    return this;
  }

  /**
   * Overrides the fallback network providers used by Network Service.
   */
  setFallbackProviders(providers) {
    if (!Array.isArray(providers) || !providers.length) {
      this.fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
      return;
    }
    this.fallbackProviders = providers
      .map((provider) => this.normalizeProviderBase(provider))
      .filter(Boolean);
    if (!this.fallbackProviders.length) {
      this.fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
    }
  }

  /**
   * Returns the fallback network providers registered with Network Service.
   */
  getFallbackProviders() {
    return [...this.fallbackProviders];
  }

  /**
   * Sets the default provider base URL for Network Service.
   */
  setDefaultProviderBase(provider) {
    this.defaultProviderBase = normalizeProviderBaseRawValue(provider);
  }

  /**
   * Resolves the default provider base that Network Service will use.
   */
  getDefaultProviderBase() {
    return this.defaultProviderBase;
  }

  /**
   * Configures provider aliases for Network Service.
   */
  setProviderAliases(aliases) {
    this.providerAliases = createAliasMap({
      ...DEFAULT_PROVIDER_ALIASES,
      ...aliases
    });
  }

  /**
   * Normalizes the proxy mode before Network Service consumes it.
   */
  normalizeProxyMode(mode) {
    if (!mode) return PROXY_MODE_AUTO;
    const normalized = String(mode).trim().toLowerCase();
    return normalized === PROXY_MODE_PROXY || normalized === PROXY_MODE_DIRECT
      ? normalized
      : PROXY_MODE_AUTO;
  }

  /**
   * Returns the normalized proxy mode for Network Service.
   */
  getProxyMode() {
    const globalMode = this.normalizeProxyMode(globalObject.__RWTRA_PROXY_MODE__);
    if (globalMode !== PROXY_MODE_AUTO) {
      return globalMode;
    }
    try {
      const envMode = this.normalizeProxyMode(
        typeof globalObject.process !== "undefined" &&
          globalObject.process.env &&
          globalObject.process.env.RWTRA_PROXY_MODE
      );
      if (envMode !== PROXY_MODE_AUTO) {
        return envMode;
      }
    } catch (_err) {
      // Accessing process.env can fail in some sandboxed environments; default to auto.
    }
    return PROXY_MODE_AUTO;
  }

  /**
   * Is Ci Like Host for Network Service.
   */
  isCiLikeHost() {
    if (typeof globalObject.window === "undefined") return false;
    const host =
      globalObject.window.location && globalObject.window.location.hostname;
    return host === "127.0.0.1" || host === "localhost";
  }

  /**
   * Loads a script from the network on behalf of Network Service.
   */
  loadScript(url) {
    const document = globalObject.document;
    if (!document) {
      return Promise.reject(new Error("Document unavailable for loadScript"));
    }
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url;
      el.onload = () => {
        this.logClient("loadScript:success", { url });
        resolve();
      };
      el.onerror = () => {
        this.logClient("loadScript:error", { url });
        reject(new Error("Failed to load " + url));
      };
      document.head.appendChild(el);
    });
  }

  /**
   * Normalize Provider Base for Network Service.
   */
  normalizeProviderBase(provider) {
    if (!provider) return "";
    const alias = this.providerAliases.get(provider);
    if (alias) return alias;
    return normalizeProviderBaseRawValue(provider);
  }

  /**
   * Normalize Provider Base Raw for Network Service.
   */
  normalizeProviderBaseRaw(provider) {
    return normalizeProviderBaseRawValue(provider);
  }

  /**
   * Resolve Provider for Network Service.
   */
  resolveProvider(mod) {
    const hasDualProviders = mod.ci_provider || mod.production_provider;
    if (hasDualProviders) {
      const proxyMode = this.getProxyMode();
      const preferProxy =
        proxyMode === PROXY_MODE_PROXY ||
        (proxyMode === PROXY_MODE_AUTO && this.isCiLikeHost());
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

  /**
   * Should Retry Status for Network Service.
   */
  shouldRetryStatus(status) {
    return status === 0 || status >= 500 || status === 429;
  }

  /**
   * Probe Url for Network Service.
   */
  async probeUrl(url, opts = {}) {
    let { retries = 2, backoffMs = 300, allowGetFallback = true } = opts;
    let attempt = 0;

    while (true) {
      let lastStatus = 0;
      try {
        const fetchImpl = globalObject.fetch;
        if (!fetchImpl) {
          throw new Error("Fetch unavailable");
        }
        const res = await fetchImpl(url, {
          method: "HEAD",
          cache: "no-store"
        });
        lastStatus = res.status;
        if (res.ok) return true;

        if (allowGetFallback && (res.status === 405 || res.status === 403)) {
          const getRes = await fetchImpl(url, { method: "GET", cache: "no-store" });
          lastStatus = getRes.status;
          if (getRes.ok) return true;
        }

        if (retries > 0 && this.shouldRetryStatus(lastStatus)) {
          retries -= 1;
          await this.wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }

        this.logClient("probe:fail", { url, status: lastStatus });
        return false;
      } catch (err) {
        if (retries > 0) {
          retries -= 1;
          await this.wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }
        this.logClient("probe:fail", { url, error: err && err.message });
        return false;
      }
    }
  }

  /**
   * Resolve Module Url for Network Service.
   */
  async resolveModuleUrl(mod) {
    if (mod.url) return mod.url;

    const bases = this._collectBases(mod);
    const pkgName = mod.package || mod.name;
    const versionSegment = mod.version ? "@" + mod.version : "";
    const file = (mod.file || "").replace(/^\/+/, "");
    const pathPrefix = (mod.pathPrefix || "").replace(/^\/+|\/+$/g, "");
    const explicitPath = mod.path ? mod.path.replace(/^\/+/, "") : "";
    const combinedPath = [pathPrefix, file].filter(Boolean).join("/");

    const candidates = [];
    for (const base of bases) {
      const packageRoot = base + pkgName + versionSegment;
      if (explicitPath) {
        candidates.push(packageRoot + "/" + explicitPath);
      } else if (combinedPath) {
        candidates.push(packageRoot + "/" + combinedPath);
        candidates.push(packageRoot + "/umd/" + combinedPath);
        candidates.push(packageRoot + "/dist/" + combinedPath);
      } else {
        candidates.push(packageRoot);
      }
    }

    const seen = new Set();
    const unique = [];
    for (const c of candidates) {
      if (!seen.has(c)) {
        seen.add(c);
        unique.push(c);
      }
    }

    for (const url of unique) {
      if (await this.probeUrl(url)) {
        this.logClient("resolve:success", { name: mod.name, url });
        return url;
      }
    }

    this.logClient("resolve:fail", { name: mod.name, tried: unique });

    throw new Error(
      "Unable to resolve URL for module " +
        (mod.name || "<unnamed>") +
        " (tried: " +
        unique.join(", ") +
        ")"
    );
  }

  /**
   * Performs the internal collect bases step for Network Service.
   */
  _collectBases(mod) {
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

module.exports = NetworkService;
