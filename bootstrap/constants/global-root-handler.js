/**
 * Encapsulates access to the current global object and its bootstrap namespace.
 */
class GlobalRootHandler {
  constructor(root) {
    this._root = root;
    this._namespace = null;
  }

  _ensureRoot() {
    if (!this._root) {
      this._root = this._detectGlobal();
    }
    return this._root;
  }

  _detectGlobal() {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    return this;
  }

  /**
   * Shared global object reference.
   */
  get root() {
    return this._ensureRoot();
  }

  /**
   * Returns the bootstrap namespace object located on the global root.
   */
  getNamespace() {
    if (!this._namespace) {
      const root = this._ensureRoot();
      this._namespace = root.__rwtraBootstrap || (root.__rwtraBootstrap = {});
    }
    return this._namespace;
  }

  /**
   * Returns the helper registry namespace that services/helpers share.
   */
  get helpers() {
    const namespace = this.getNamespace();
    return namespace.helpers || (namespace.helpers = {});
  }

  /**
   * Returns the global document reference if available.
   */
  getDocument() {
    return this.root.document;
  }

  /**
   * Returns a bound `fetch` implementation if the runtime exposes one.
   */
  getFetch() {
    const fn = this.root.fetch;
    return typeof fn === "function" ? fn.bind(this.root) : undefined;
  }

  /**
   * Produces a logger that writes to `console.error` under the provided tag.
   */
  getLogger(tag = "rwtra") {
    return (msg, data) => {
      if (typeof console !== "undefined" && console.error) {
        console.error(tag, msg, data || "");
      }
    };
  }

  /**
   * Returns whether the current runtime exposes a global window object.
   */
  hasWindow() {
    return typeof this.root.window !== "undefined";
  }

  /**
   * Returns whether the current runtime exposes a global document object.
   */
  hasDocument() {
    return typeof this.root.document !== "undefined";
  }
}

module.exports = GlobalRootHandler;
