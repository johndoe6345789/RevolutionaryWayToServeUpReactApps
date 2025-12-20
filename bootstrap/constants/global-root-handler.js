/**
 * Encapsulates access to the current global object and its bootstrap namespace.
 */
class GlobalRootHandler {
  constructor(root) {
    this.root = root || this._detectGlobal();
    this.namespace = this.root.__rwtraBootstrap || (this.root.__rwtraBootstrap = {});
  }

  _detectGlobal() {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    return this;
  }

  get helpers() {
    return this.namespace.helpers || (this.namespace.helpers = {});
  }
}

module.exports = GlobalRootHandler;
