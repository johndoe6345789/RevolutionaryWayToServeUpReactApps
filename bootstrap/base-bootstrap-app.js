const GlobalRootHandler = require("./constants/global-root-handler.js");

class BaseBootstrapApp {
  constructor({ rootHandler = new GlobalRootHandler() } = {}) {
    this.rootHandler = rootHandler;
    this.globalRoot = this.rootHandler.root;
    this.bootstrapNamespace = this.rootHandler.getNamespace();
    this.helpersNamespace = this.rootHandler.helpers;
    this.isCommonJs = typeof module !== "undefined" && module.exports;
  }

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

  _resolveHelper(name, path) {
    return this.isCommonJs ? require(path) : this.helpersNamespace[name] || {};
  }
}

module.exports = BaseBootstrapApp;
