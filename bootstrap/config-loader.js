const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};
const hasWindow = typeof window !== "undefined";

class BootstrapConfigLoader {
  constructor({ fetch } = {}) { this.config = { fetch }; this.initialized = false; this.cachedPromise = null; }

  initialize() {
    if (this.initialized) {
      throw new Error("BootstrapConfigLoader already initialized");
    }
    this.initialized = true;
    const fallbackFetch =
      typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined;
    this.fetchImpl = this.config.fetch ?? fallbackFetch;
  }

  async loadConfig() {
    if (hasWindow) {
      if (window.__rwtraConfig) {
        return window.__rwtraConfig;
      }
      if (window.__rwtraConfigPromise) {
        return window.__rwtraConfigPromise;
      }
    }
    if (!this.initialized) {
      throw new Error("BootstrapConfigLoader not initialized");
    }
    if (!this.cachedPromise) {
      this.cachedPromise = this._fetchConfig();
      if (hasWindow) {
        window.__rwtraConfigPromise = this.cachedPromise;
      }
    }
    const config = await this.cachedPromise;
    if (hasWindow) {
      window.__rwtraConfig = config;
    }
    return config;
  }
  async _fetchConfig() {
    if (!this.fetchImpl) {
      throw new Error("Fetch is unavailable when loading config.json");
    }
    const response = await this.fetchImpl("config.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    return response.json();
  }
}

module.exports = BootstrapConfigLoader;
