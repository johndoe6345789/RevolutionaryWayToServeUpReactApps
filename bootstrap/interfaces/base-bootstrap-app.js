const GlobalRootHandler = require("../constants/global-root-handler.js");

/**
 * Provides the shared bootstrap scaffolding that other entrypoints rely upon.
 */
class BaseBootstrapApp {
  /**
   * @param {{rootHandler?: GlobalRootHandler}} options
   */
  constructor({ rootHandler = new GlobalRootHandler() } = {}) {
    this.rootHandler = rootHandler;
    this.globalRoot = this.rootHandler.root;
    this.bootstrapNamespace = this.rootHandler.getNamespace();
    this.helpersNamespace = this.rootHandler.helpers;
    this.isCommonJs = typeof global !== "undefined" && global.module !== undefined;
  }

  /**
   * Detects whether the evaluated runtime exposes a `window.document`.
   */
  static isBrowser(windowObj) {
    const win =
      windowObj ??
      (typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
        ? globalThis
        : undefined);
    return !!(win && typeof win.document !== "undefined");
  }

  /**
   * Resolves helpers either through `require` (CommonJS) or via the shared helper registry.
   */
  _resolveHelper(name, path) {
    return this.isCommonJs ? require(path) : this.helpersNamespace[name] || {};
  }
}

module.exports = BaseBootstrapApp;
