const hasDocument = typeof document !== "undefined";
const globalObj =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};
const { scriptManifestUrl: SCRIPT_MANIFEST_URL } = require("./constants/common.js");

const ScriptListLoaderConfig = require("./configs/script-list-loader.js");

/**
 * Loads the script manifest and sequentially injects each referenced script tag.
 */
class ScriptListLoader {
  constructor(config = new ScriptListLoaderConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("ScriptListLoader already initialized");
    }
    this.initialized = true;
    this.document = this.config.document ?? (hasDocument ? document : null);
    this.manifestUrl = this.config.manifestUrl ?? SCRIPT_MANIFEST_URL;
    this.fetchImpl =
      this.config.fetch ??
      (typeof globalObj.fetch === "function" ? globalObj.fetch.bind(globalObj) : undefined);
    this.log =
      this.config.log ??
      ((msg, data) => {
        if (typeof console !== "undefined" && console.error) {
          console.error("rwtra:scripts", msg, data || "");
        }
      });
  }

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
