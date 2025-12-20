const globalRoot = require("../../constants/global-root.js");
const SassCompilerConfig = require("../../configs/sass-compiler.js");

/**
 * Wraps Sass compilation/injection using the configured Sass implementation.
 */
class SassCompilerService {
  constructor(config = new SassCompilerConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("SassCompilerService already initialized");
    }
    this.initialized = true;
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for SassCompilerService");
    }
    this.fetchImpl =
      this.config.fetch ??
      (typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined);
    this.document = this.config.document ?? globalRoot.document;
    this.SassImpl = this.config.SassImpl ?? globalRoot.Sass;
  }

  async compileSCSS(scssFile) {
    if (!this.fetchImpl) {
      throw new Error("Fetch is unavailable when compiling SCSS");
    }
    if (!this.document) {
      throw new Error("Document is unavailable for Sass compilation");
    }
    const res = await this.fetchImpl(scssFile, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + scssFile);
    const scss = await res.text();
    const SassImpl = this.SassImpl;
    if (!SassImpl) {
      throw new Error("Sass global not found (is your Sass tool loaded?)");
    }

    return new Promise((resolve, reject) => {
      try {
        if (typeof SassImpl === "function") {
          const sass = new SassImpl();
          sass.compile(scss, (result) => {
            if (result.status === 0) {
              resolve(result.text);
            } else {
              reject(
                new Error(result.formatted || "Sass (sass.js) compile error")
              );
            }
          });
          return;
        }

        if (typeof SassImpl.compile === "function") {
          if (SassImpl.compile.length >= 2) {
            SassImpl.compile(scss, (result) => {
              if (result.status === 0) {
                resolve(result.text);
              } else {
                reject(
                  new Error(result.formatted || "Sass (object) compile error")
                );
              }
            });
            return;
          }

          const result = SassImpl.compile(scss);
          const css = typeof result === "string" ? result : result.css || "";
          resolve(css);
          return;
        }

        reject(
          new Error(
            "Unsupported Sass implementation: neither constructor nor usable compile() found"
          )
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  injectCSS(css) {
    if (!this.document) {
      throw new Error("Document is unavailable when injecting CSS");
    }
    const tag = this.document.createElement("style");
    tag.textContent = css;
    this.document.head.appendChild(tag);
  }

  get exports() {
    return {
      compileSCSS: this.compileSCSS.bind(this),
      injectCSS: this.injectCSS.bind(this),
    };
  }

  install() {
    if (!this.initialized) {
      throw new Error("SassCompilerService not initialized");
    }
    const exports = this.exports;
    const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
    const helpers = namespace.helpers || (namespace.helpers = {});
    helpers.sassCompiler = exports;
    this.serviceRegistry.register("sassCompiler", exports, {
      folder: "services/local",
      domain: "local",
    });
    if (typeof module !== "undefined" && module.exports) {
      module.exports = exports;
    }
  }
}

module.exports = SassCompilerService;
