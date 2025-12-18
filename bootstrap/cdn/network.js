 (function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs
    ? require("./logging.js")
    : helpers.logging;
  const { logClient = () => {}, wait = () => Promise.resolve() } = logging || {};

  const DEFAULT_FALLBACK_PROVIDERS = [];
  let fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
  let defaultProviderBase = "";
  let providerAliases = new Map();

  function setFallbackProviders(providers) {
    if (!Array.isArray(providers) || !providers.length) {
      fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
      return;
    }
    fallbackProviders = providers
      .map((provider) => normalizeProviderBase(provider))
      .filter(Boolean);
    if (!fallbackProviders.length) {
      fallbackProviders = [...DEFAULT_FALLBACK_PROVIDERS];
    }
  }

  function getFallbackProviders() {
    return [...fallbackProviders];
  }

  function setDefaultProviderBase(provider) {
    defaultProviderBase = normalizeProviderBaseRaw(provider);
  }

  function getDefaultProviderBase() {
    return defaultProviderBase;
  }

  function setProviderAliases(aliases) {
    const updated = new Map();
    if (aliases && typeof aliases === "object") {
      for (const [alias, value] of Object.entries(aliases)) {
        if (!alias) continue;
        const normalized = normalizeProviderBaseRaw(value);
        if (normalized) {
          updated.set(alias, normalized);
        }
      }
    }
    providerAliases = updated;
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url;
      el.onload = () => {
        logClient("loadScript:success", { url });
        resolve();
      };
      el.onerror = () => {
        logClient("loadScript:error", { url });
        reject(new Error("Failed to load " + url));
      };
      document.head.appendChild(el);
    });
  }

  function normalizeProviderBase(provider) {
    if (!provider) return "";
    const alias = providerAliases.get(provider);
    if (alias) return alias;
    return normalizeProviderBaseRaw(provider);
  }

  function normalizeProviderBaseRaw(provider) {
    if (!provider) return "";
    if (provider.startsWith("/")) {
      return provider.endsWith("/") ? provider : provider + "/";
    }
    if (provider.startsWith("http://") || provider.startsWith("https://")) {
      return provider.endsWith("/") ? provider : provider + "/";
    }
    return "https://" + provider.replace(/\/+$/, "") + "/";
  }

  function resolveProvider(mod) {
    const hasDualProviders = mod.ci_provider || mod.production_provider;
    if (hasDualProviders) {
      const host = typeof window !== "undefined" ? window.location.hostname : "";
      const isCiLike = host === "127.0.0.1" || host === "localhost";
      return isCiLike ? mod.ci_provider || mod.production_provider : mod.production_provider || mod.ci_provider;
    }
    return (
      mod.provider ||
      mod.ci_provider ||
      mod.production_provider ||
      defaultProviderBase ||
      ""
    );
  }

  function shouldRetryStatus(status) {
    return status === 0 || status >= 500 || status === 429;
  }

  async function probeUrl(url, opts = {}) {
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

        if (retries > 0 && shouldRetryStatus(lastStatus)) {
          retries -= 1;
          await wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }

        if (logging) {
          logClient("probe:fail", { url, status: lastStatus });
        }
        return false;
      } catch (err) {
        if (retries > 0) {
          retries -= 1;
          await wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }
        if (logging) {
          logClient("probe:fail", { url, error: err && err.message });
        }
        return false;
      }
    }
  }

  async function resolveModuleUrl(mod) {
    if (mod.url) return mod.url;

    function collectBases() {
      const bases = [];
      const addBase = (b) => {
        if (!b) return;
        const normalized = normalizeProviderBase(b);
        if (!bases.includes(normalized)) bases.push(normalized);
      };

      addBase(resolveProvider(mod));
      addBase(mod.provider);
      addBase(mod.ci_provider);
      addBase(mod.production_provider);
      if (mod.allowJsDelivr !== false) {
        for (const fallback of fallbackProviders) {
          addBase(fallback);
        }
      }
      return bases;
    }

    const bases = collectBases();
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
      if (await probeUrl(url)) {
        if (logging) {
          logClient("resolve:success", { name: mod.name, url });
        }
        return url;
      }
    }

    if (logging) {
      logClient("resolve:fail", { name: mod.name, tried: unique });
    }

    throw new Error(
      "Unable to resolve URL for module " +
        (mod.name || "<unnamed>") +
        " (tried: " +
        unique.join(", ") +
        ")"
    );
  }

  const exports = {
    loadScript,
    normalizeProviderBase,
    resolveProvider,
    shouldRetryStatus,
    probeUrl,
    resolveModuleUrl,
    setFallbackProviders,
    getFallbackProviders,
    setDefaultProviderBase,
    getDefaultProviderBase,
    setProviderAliases
  };

  helpers.network = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
