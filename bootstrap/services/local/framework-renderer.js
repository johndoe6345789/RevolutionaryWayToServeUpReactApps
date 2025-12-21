/**
 * Handles rendering the configured entry component to the DOM.
 */
class FrameworkRendererConfig {
  /**
   * Initializes a new Framework Renderer Config instance with the provided configuration.
   */
  constructor({ document } = {}) {
    this.document = document;
  }
}

class FrameworkRenderer {
  constructor(config = new FrameworkRendererConfig()) {
    this.config = config;
    this.initialized = false;
    this.document = null;
  }

  /**
   * Sets up the Framework Renderer instance before it handles requests.
   */
  initialize() {
    if (this.initialized) {
      throw new Error("FrameworkRenderer already initialized");
    }
    this.document = this.config.document;
    if (!this.document) {
      throw new Error("Document required for FrameworkRenderer");
    }
    this.initialized = true;
    return this;
  }

  /**
   * Render for Framework Renderer.
   */
  render(config, registry, App) {
    if (!this.initialized) {
      throw new Error("FrameworkRenderer not initialized");
    }

    const renderConfig = config.render || {};
    const rootId = renderConfig.rootId || "root";
    const rootEl = this.document.getElementById(rootId);
    if (!rootEl) {
      throw new Error("Root element not found: #" + rootId);
    }

    const domModuleName = renderConfig.domModule;
    const reactModuleName = renderConfig.reactModule;
    const domModule = domModuleName ? registry[domModuleName] : null;
    const reactModule = reactModuleName ? registry[reactModuleName] : null;
    if (!domModule) {
      throw new Error("DOM render module missing: " + domModuleName);
    }
    if (!reactModule) {
      throw new Error("React module missing: " + reactModuleName);
    }

    const createRootFn = this._getModuleExport(domModule, renderConfig.createRoot);
    if (!createRootFn) {
      throw new Error("createRoot not found: " + renderConfig.createRoot);
    }

    const root = createRootFn(rootEl);
    const renderMethod = renderConfig.renderMethod || "render";
    if (typeof root[renderMethod] !== "function") {
      throw new Error("Render method not found: " + renderMethod);
    }

    const createElementFn = this._getModuleExport(reactModule, "createElement");
    if (!createElementFn) {
      throw new Error("createElement not found on React module");
    }
    root[renderMethod](createElementFn(App));
  }

  /**
   * Returns the exported value for Framework Renderer modules.
   */
  _getModuleExport(mod, name) {
    if (!mod) return null;
    if (Object.prototype.hasOwnProperty.call(mod, name)) {
      return mod[name];
    }
    if (mod.default && Object.prototype.hasOwnProperty.call(mod.default, name)) {
      return mod.default[name];
    }
    return null;
  }
}

FrameworkRenderer.Config = FrameworkRendererConfig;

module.exports = FrameworkRenderer;
