const ImportMapInitConfig = require("../configs/import-map-init.js");

class ImportMapInitializer {
  constructor(config = new ImportMapInitConfig()) { this.config = config; this.initialized = false; }

  async initialize() {
    if (this.initialized) {
      throw new Error("ImportMapInitializer already initialized");
    }
    this.initialized = true;
    this.window = this.config.window ?? (typeof window !== "undefined" ? window : null);
    this.fetchImpl =
      this.config.fetch ??
      (typeof fetch !== "undefined"
        ? fetch.bind(typeof globalThis !== "undefined" ? globalThis : this.window)
        : undefined);
    if (!this.window) {
      return;
    }
    const importMapEl = this.window.document.querySelector("script[data-rwtra-importmap]");
    if (!importMapEl) {
      return;
    }

    const namespace = this.window.__rwtraBootstrap || (this.window.__rwtraBootstrap = {});
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

    if (this.window.__rwtraConfigPromise) {
      return;
    }

    const configUrl = "config.json";
    const configPromise = this._fetchConfig(configUrl)
      .then(async (config) => {
        this.window.__rwtraConfig = config;
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

    this.window.__rwtraConfigPromise = configPromise;
  }

  async _fetchConfig(configUrl) {
    if (!this.fetchImpl) {
      throw new Error("Fetch unavailable when initializing import map");
    }
    const res = await this.fetchImpl(configUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch " + configUrl + ": " + res.status);
    }
    return res.json();
  }
}

const importMapInitializer = new ImportMapInitializer();
importMapInitializer.initialize();
