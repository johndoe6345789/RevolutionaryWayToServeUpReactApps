(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs ? require("./logging.js") : helpers.logging;
  const { logClient = () => {}, wait = () => Promise.resolve() } = logging || {};

  const DEFAULT_FALLBACK_PROVIDERS = require("../constants/default-fallback-providers.js");
  const getDefaultProviderAliases = require("../constants/default-provider-aliases.js");
  const DEFAULT_PROVIDER_ALIASES = getDefaultProviderAliases(global, isCommonJs);

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

  const PROXY_MODE_AUTO = require("../constants/proxy-mode-auto.js");
  const PROXY_MODE_PROXY = require("../constants/proxy-mode-proxy.js");
  const PROXY_MODE_DIRECT = require("../constants/proxy-mode-direct.js");

  class NetworkService {
    constructor(logClientFn, waitFn) { this.logClient = logClientFn; this.wait = waitFn; this.initialized = false; }

    initialize() {
      if (this.initialized) {
        throw new Error("NetworkService already initialized");
      }
      this.initialized = true;
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
    }

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
        ...DEFAULT_PROVIDER_ALIASES,
        ...aliases
      });
    }

    normalizeProxyMode(mode) {
      if (!mode) return PROXY_MODE_AUTO;
      const normalized = String(mode).trim().toLowerCase();
      return normalized === PROXY_MODE_PROXY || normalized === PROXY_MODE_DIRECT
        ? normalized
        : PROXY_MODE_AUTO;
    }

    getProxyMode() {
      const globalMode = this.normalizeProxyMode(global.__RWTRA_PROXY_MODE__);
      if (globalMode !== PROXY_MODE_AUTO) {
        return globalMode;
      }
      try {
        const envMode = this.normalizeProxyMode(
          typeof process !== "undefined" && process.env && process.env.RWTRA_PROXY_MODE
        );
        if (envMode !== PROXY_MODE_AUTO) {
          return envMode;
        }
      } catch (_err) {
        // Accessing process.env can fail in some sandboxed environments; default to auto.
      }
      return PROXY_MODE_AUTO;
    }

    isCiLikeHost() {
      if (typeof window === "undefined") return false;
      const host = window.location && window.location.hostname;
      return host === "127.0.0.1" || host === "localhost";
    }

    loadScript(url) {
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

    shouldRetryStatus(status) {
      return status === 0 || status >= 500 || status === 429;
    }

    async probeUrl(url, opts = {}) {
      let { retries = 2, backoffMs = 300, allowGetFallback = true } = opts;
      let attempt = 0;

      while (true) {
        let lastStatus = 0;
        try {
          const res = await fetch(url, {
            method: "HEAD",
            cache: "no-store"
          });
          lastStatus = res.status;
          if (res.ok) return true;

          if (allowGetFallback && (res.status === 405 || res.status === 403)) {
            const getRes = await fetch(url, { method: "GET", cache: "no-store" });
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

  const networkService = new NetworkService(logClient, wait);
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
    normalizeProviderBaseRaw: networkService.normalizeProviderBaseRaw
  };

  helpers.network = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
