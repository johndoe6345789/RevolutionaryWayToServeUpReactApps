const BaseService = require("../base-service.js");
const ScriptListLoaderConfig = require("../../configs/script-list-loader.js");
const GlobalRootHandler = require("../../constants/global-root-handler.js");

/**
 * Loads the script manifest and sequentially injects each referenced script tag.
 */
class ScriptListLoader extends BaseService {
  constructor(config) {
    const providedHandler = config && config.rootHandler;
    const handler = providedHandler ?? new GlobalRootHandler();
    const normalizedConfig =
      config instanceof ScriptListLoaderConfig
        ? config
        : new ScriptListLoaderConfig({ ...(config || {}), rootHandler: handler });
    super(normalizedConfig);
    this.rootHandler = normalizedConfig.rootHandler;
  }

  /**
   * Sets up the Script List Loader instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    this.document = this.config.document;
    this.manifestUrl = this.config.manifestUrl;
    this.fetchImpl = this.config.fetch;
    this.log = this.config.log;
    return this;
  }

  /**
   * Loads a script from the network on behalf of Script List Loader.
   */
  async loadScript(src) {
    if (!this.document) {
      throw new Error("Document is unavailable when loading scripts");
    }
    return new Promise((resolve, reject) => {
      const script = this.document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load " + src));
      const parent = this.document.head || this.document.documentElement;
      parent.appendChild(script);
    });
  }

  /**
   * Loads scripts in the manifest for Script List Loader.
   */
  async loadFromManifest() {
    if (!this.fetchImpl) {
      throw new Error("Fetch is unavailable when loading the script manifest");
    }
    const res = await this.fetchImpl(this.manifestUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(
        "Failed to load script manifest " +
          this.manifestUrl +
          ": " +
          res.status
      );
    }
    const html = await res.text();
    if (!this.document) return;
    const template = this.document.createElement("template");
    template.innerHTML = html;
    const scripts = Array.from(
      template.content.querySelectorAll("script[src]")
    );
    for (const script of scripts) {
      const src = script.getAttribute("src");
      if (!src) continue;
      await this.loadScript(src);
    }
  }

  /**
   * Loads the scripts declared for Script List Loader.
   */
  async load() {
    if (!this.document) {
      return;
    }
    try {
      await this.loadFromManifest();
    } catch (err) {
      this.log("load:error", err);
    }
  }
}

module.exports = ScriptListLoader;
