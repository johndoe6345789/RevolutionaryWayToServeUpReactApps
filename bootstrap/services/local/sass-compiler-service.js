const BaseService = require("../../interfaces/base-service.js");
const SassCompilerConfig = require("../../configs/local/sass-compiler.js");

/**
 * Wraps Sass compilation/injection using the configured Sass implementation.
 */
class SassCompilerService extends BaseService {
  constructor(config = new SassCompilerConfig()) { super(config); }

  /**
   * Prepares the Sass helpers, ensuring fetch/document hooks are available.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    this.serviceRegistry = this._requireServiceRegistry();
    this.fetchImpl = this.config.fetch;
    this.document = this.config.document;
    this.SassImpl = this.config.SassImpl;
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    return this;
  }

  /**
   * Compiles SCSS via the configured Sass implementation.
   */
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

  /**
   * Injects compiled CSS into the document head.
   */
  injectCSS(css) {
    if (!this.document) {
      throw new Error("Document is unavailable when injecting CSS");
    }
    const tag = this.document.createElement("style");
    tag.textContent = css;
    this.document.head.appendChild(tag);
  }

  /**
   * Exposes the public Sass helpers for other services.
   */
  get exports() {
    return {
      compileSCSS: this.compileSCSS.bind(this),
      injectCSS: this.injectCSS.bind(this),
    };
  }

  /**
   * Registers the Sass helpers into the namespace and service registry.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    const helpers = this.namespace.helpers || (this.namespace.helpers = {});
    helpers.sassCompiler = exports;
    this.serviceRegistry.register("sassCompiler", exports, {
      folder: "services/local",
      domain: "local",
    }, []);
    if (typeof module !== "undefined" && module.exports) {
      module.exports = exports;
    }
    return this;
  }

  /**
   * Validates that a namespace object was supplied via config.
   */
  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = SassCompilerService;
