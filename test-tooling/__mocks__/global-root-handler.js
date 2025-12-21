// Mock implementation for GlobalRootHandler
class MockGlobalRootHandler {
  constructor(root) {
    this._root = root || this._detectGlobal();
    this._namespace = null;
  }

  _detectGlobal() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    return this;
  }

  _ensureRoot(root) {
    return root || this._detectGlobal();
  }

  get root() {
    return this._ensureRoot(this._root);
  }

  getNamespace() {
    if (!this.root.__rwtraBootstrap) {
      this.root.__rwtraBootstrap = {};
    }
    this._namespace = this.root.__rwtraBootstrap;
    return this._namespace;
  }

  get helpers() {
    const namespace = this.getNamespace();
    if (!namespace.helpers) {
      namespace.helpers = {};
    }
    return namespace.helpers;
  }

  getDocument() {
    return this.root?.document;
  }

  getFetch() {
    return this.root?.fetch;
  }

  getLogger(tag = 'rwtra') {
    return (message, data) => {
      if (typeof console?.error === 'function') {
        if (data !== undefined) {
          console.error(`[${tag}]`, message, data);
        } else {
          console.error(`[${tag}]`, message);
        }
      }
    };
  }

  hasWindow() {
    return !!(this.root?.window || (typeof window !== 'undefined' && this.root === window));
  }

  hasDocument() {
    return !!(this.root?.document);
  }
}

module.exports = MockGlobalRootHandler;
