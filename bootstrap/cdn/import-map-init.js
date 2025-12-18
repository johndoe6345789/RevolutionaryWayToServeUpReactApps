(function () {
  if (typeof window === "undefined") {
    return;
  }
  const importMapEl = document.querySelector("script[data-rwtra-importmap]");
  if (!importMapEl) {
    return;
  }

  const namespace =
    window.__rwtraBootstrap || (window.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});
  const network = helpers.network || {};
  const resolveModuleUrl =
    typeof network.resolveModuleUrl === "function"
      ? network.resolveModuleUrl
      : () => Promise.resolve("");
  const setFallbackProviders =
    typeof network.setFallbackProviders === "function"
      ? network.setFallbackProviders
      : () => {};
  const setDefaultProviderBase =
    typeof network.setDefaultProviderBase === "function"
      ? network.setDefaultProviderBase
      : () => {};
  const setProviderAliases =
    typeof network.setProviderAliases === "function"
      ? network.setProviderAliases
      : () => {};

  if (window.__rwtraConfigPromise) {
    return;
  }

  const configUrl = "config.json";
  const configPromise = fetch(configUrl, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch " + configUrl + ": " + res.status);
      }
      return res.json();
    })
    .then(async (config) => {
      window.__rwtraConfig = config;
      setFallbackProviders(config.fallbackProviders);
      setDefaultProviderBase(config.providers?.default);
      setProviderAliases(config.providers?.aliases);
      const modules = Array.isArray(config.modules) ? config.modules : [];
      const imports = {};
      for (const mod of modules) {
        const url = mod.url || (await resolveModuleUrl(mod));
        if (!url) {
          throw new Error(
            "Failed to resolve module URL for " +
              (mod && mod.name ? mod.name : "<unknown>")
          );
        }
        mod.url = url;
        const specifiers =
          Array.isArray(mod.importSpecifiers) && mod.importSpecifiers.length
            ? mod.importSpecifiers
            : [mod.name];
        for (const spec of specifiers) {
          if (typeof spec !== "string" || !spec) {
            continue;
          }
          imports[spec] = url;
        }
      }
      importMapEl.textContent = JSON.stringify({ imports }, null, 2);
      return config;
    })
    .catch((err) => {
      console.error("rwtra: failed to initialize import map", err);
      throw err;
    });

  window.__rwtraConfigPromise = configPromise;
})();
