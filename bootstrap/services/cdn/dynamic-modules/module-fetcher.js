const BaseHelper = require("../../../../interfaces/base-helper.js");
const DynamicModuleFetcherConfig = require("./module-fetcher-config.js");

const globalScope =
  typeof window !== "undefined"
    ? window
    : typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};

/**
 * Handles probing URLs and loading a namespace either as ESM or global.
 */
class DynamicModuleFetcher extends BaseHelper {
  constructor(config = new DynamicModuleFetcherConfig()) {
    super(config);
    this.config = config;
    this.service = config.service;
  }

  /**
   * Sets up the Dynamic Module Fetcher instance before it handles requests.
   */
  initialize() {
    if (this.initialized) {
      return this;
    }
    if (this.config.helperRegistry) {
      this._registerHelper("dynamicModuleFetcher", this, {
        folder: "services/cdn",
        domain: "cdn",
      });
    }
    this.initialized = true;
    return this;
  }

  /**
   * Fetch Namespace for Dynamic Module Fetcher.
   */
  async fetchNamespace(rule, icon, registry, urls) {
    const foundUrl = await this._findUrl(urls);
    return this._loadNamespace(foundUrl, rule, icon, registry);
  }

  /**
   * Performs the internal find url step for Dynamic Module Fetcher.
   */
  async _findUrl(urls) {
    for (const url of urls) {
      if (await this.service.probeUrl(url)) {
        return url;
      }
    }
    throw new Error("No candidate resolved: " + urls.join(", "));
  }

  /**
   * Performs the internal load namespace step for Dynamic Module Fetcher.
   */
  async _loadNamespace(url, rule, icon, registry) {
    const format = (rule.format || rule.type || "global").toLowerCase();
    if (format === "esm" || format === "module") {
      return this._loadEsm(url, rule, icon, registry);
    }
    return this._loadGlobal(url, rule, icon, registry);
  }

  /**
   * Performs the internal load esm step for Dynamic Module Fetcher.
   */
  async _loadEsm(url, rule, icon, registry) {
    const moduleExports = await import(url);
    const namespace = this.service.createNamespace(moduleExports);
    this.service.logClient("dynamic-module:loaded", {
      name: icon,
      url,
      format: (rule.format || rule.type || "global").toLowerCase(),
    });
    registry[icon] = namespace;
    return namespace;
  }

  /**
   * Performs the internal load global step for Dynamic Module Fetcher.
   */
  async _loadGlobal(url, rule, icon, registry) {
    await this.service.loadScript(url);
    const globalName = this._resolveGlobalName(rule, icon);
    const globalObj = this._resolveGlobalObject(globalName);
    if (!globalObj) {
      throw new Error("Global for icon " + icon + " not found: " + globalName);
    }
    const namespace = this.service.createNamespace(globalObj);
    registry[icon] = namespace;
    this.service.logClient("dynamic-module:loaded", {
      name: icon,
      url,
      global: globalName,
      format: (rule.format || rule.type || "global").toLowerCase(),
    });
    return namespace;
  }

  /**
   * Performs the internal resolve global name step for Dynamic Module Fetcher.
   */
  _resolveGlobalName(rule, icon) {
    return (rule.globalPattern || "{icon}").replace("{icon}", icon);
  }

  /**
   * Performs the internal resolve global object step for Dynamic Module Fetcher.
   */
  _resolveGlobalObject(globalName) {
    if (!globalName) return null;
    if (globalName.includes(".")) {
      return globalName.split(".").reduce((obj, part) => (obj ? obj[part] : undefined), globalScope);
    }
    return globalScope[globalName];
  }
}

module.exports = DynamicModuleFetcher;
