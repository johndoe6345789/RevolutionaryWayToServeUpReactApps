const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};
const hasWindow = typeof window !== "undefined";

/**
 * Loads config.json once and caches the promise/results for reuse.
 */
class BootstrapConfigLoader {
  /**
   * Initializes a new Bootstrap Config Loader instance with the provided configuration.
   */
  constructor({ fetch } = {}) { this.config = { fetch }; this.initialized = false; this.cachedPromise = null; }

  /**
   * Sets up the Bootstrap Config Loader instance before it handles requests.
   */
  initialize() {
    if (this.initialized) {
      throw new Error("BootstrapConfigLoader already initialized");
    }
    this.initialized = true;
    const fallbackFetch =
      typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined;
    this.fetchImpl = this.config.fetch ?? fallbackFetch;
  }

  /**
   * Loads the runtime configuration for Bootstrap Config Loader.
   */
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
  /**
   * Fetches the configuration data that Bootstrap Config Loader depends on.
   */
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
