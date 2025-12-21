/**
 * Base skeleton class for global handler classes.
 * Provides common implementation of IGlobalHandler interface methods.
 */
class BaseGlobalHandler {
  /**
   * Creates a new BaseGlobalHandler instance with optional root object.
   * @param root - Optional global root object
   */
  constructor(root) {
    this._root = root || this._detectGlobal();
    this._namespace = null;
    this._helpers = null;
  }

  /**
   * Gets the global root object (globalThis, global, window, etc.).
   * @returns The global root object
   */
  get root() {
    return this._ensureRoot();
  }

  /**
   * Lazily caches and returns the detected global root reference.
   * @returns The global root object
   * @private
   */
  _ensureRoot() {
    if (!this._root) {
      this._root = this._detectGlobal();
    }
    return this._root;
  }

  /**
   * Identifies the current global scope using the widest available reference.
   * @returns The global root object
   * @private
   */
  _detectGlobal() {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    if (typeof window !== "undefined") return window;
    if (typeof self !== "undefined") return self;
    return this;
  }

  /**
   * Gets the bootstrap namespace object located on the global root.
   * @returns The bootstrap namespace object
   */
  getNamespace() {
    if (!this._namespace) {
      const root = this._ensureRoot();
      const namespaceKey = this._getNamespaceKey();
      this._namespace = root[namespaceKey] || (root[namespaceKey] = {});
    }
    return this._namespace;
  }

  /**
   * Returns the helper registry namespace that services/helpers share.
   * @returns The helpers namespace object
   */
  get helpers() {
    if (!this._helpers) {
      const namespace = this.getNamespace();
      this._helpers = namespace.helpers || (namespace.helpers = {});
    }
    return this._helpers;
  }

  /**
   * Returns the global document reference if available.
   * @returns The document object or undefined
   */
  getDocument() {
    const root = this._ensureRoot();
    return root.document;
  }

  /**
   * Returns a bound fetch implementation if the runtime exposes one.
   * @returns The fetch function or undefined
   */
  getFetch() {
    const root = this._ensureRoot();
    const fn = root.fetch;
    return typeof fn === "function" ? fn.bind(root) : undefined;
  }

  /**
   * Produces a logger that writes to console.error under the provided tag.
   * @param tag - The tag to use for logging
   * @returns A logger function
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
   * @returns True if window object exists
   */
  hasWindow() {
    const root = this._ensureRoot();
    return typeof root.window !== "undefined";
  }

  /**
   * Returns whether the current runtime exposes a global document object.
   * @returns True if document object exists
   */
  hasDocument() {
    const root = this._ensureRoot();
    return typeof root.document !== "undefined";
  }

  /**
   * Gets the namespace key used for storing bootstrap data.
   * @returns The namespace key string
   * @protected
   */
  _getNamespaceKey() {
    return "__rwtraBootstrap";
  }

  /**
   * Sets a custom namespace key for storing bootstrap data.
   * @param key - The custom namespace key
   */
  setNamespaceKey(key) {
    this._namespaceKey = key;
  }

  /**
   * Checks if a specific global API is available.
   * @param apiName - The name of the API to check
   * @returns True if the API is available
   */
  hasGlobalAPI(apiName) {
    const root = this._ensureRoot();
    return typeof root[apiName] !== "undefined";
  }

  /**
   * Gets a global API if available.
   * @param apiName - The name of the API to get
   * @returns The API object or undefined
   */
  getGlobalAPI(apiName) {
    const root = this._ensureRoot();
    return root[apiName];
  }

  /**
   * Creates a namespaced logger with a specific prefix.
   * @param prefix - The prefix for the logger
   * @returns A namespaced logger function
   */
  createNamespacedLogger(prefix) {
    return (msg, data) => {
      this.getLogger(prefix)(msg, data);
    };
  }

  /**
   * Checks if the current environment is a browser.
   * @returns True if running in a browser environment
   */
  isBrowser() {
    return this.hasWindow() && this.hasDocument();
  }

  /**
   * Checks if the current environment is Node.js.
   * @returns True if running in Node.js environment
   */
  isNode() {
    return typeof process !== "undefined" && process.versions && process.versions.node;
  }

  /**
   * Gets information about the current runtime environment.
   * @returns Runtime information object
   */
  getRuntimeInfo() {
    return {
      isBrowser: this.isBrowser(),
      isNode: this.isNode(),
      hasWindow: this.hasWindow(),
      hasDocument: this.hasDocument(),
      hasFetch: !!this.getFetch(),
      globalRoot: typeof this._root,
      namespaceKey: this._getNamespaceKey()
    };
  }
}

module.exports = BaseGlobalHandler;
