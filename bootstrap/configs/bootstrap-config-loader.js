/**
 * Carries optional overrides for how the bootstrap config loader fetches config.json.
 */
const fetchFallback = (() => {
  if (typeof globalThis !== "undefined" && typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }
  if (typeof global !== "undefined" && typeof global.fetch === "function") {
    return global.fetch.bind(global);
  }
  return undefined;
})();

class BootstrapConfigLoaderConfig {
  /**
   * Initializes a new Bootstrap Config Loader Config instance with the provided configuration.
   */
  constructor({ fetch } = {}) {
    this.fetch = fetch ?? fetchFallback;
  }
}

module.exports = BootstrapConfigLoaderConfig;
