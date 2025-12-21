const BaseService = require("../base-service.js");
const ToolsLoaderConfig = require("../../configs/cdn/tools.js");

/**
 * Handles fetching globals/modules and normalizing them into namespace helpers.
 */
class ToolsLoaderService extends BaseService {
  constructor(config = new ToolsLoaderConfig()) { super(config); }

  /**
   * Prepares runtime dependencies and registers helpers into the namespace.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    const dependencies = this.config.dependencies || {};
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.serviceRegistry = this._requireServiceRegistry();
    this.logging =
      dependencies.logging ??
      (this.isCommonJs ? require("../../cdn/logging.js") : this.helpers.logging);
    this.network =
      dependencies.network ??
      (this.isCommonJs ? require("../../cdn/network.js") : this.helpers.network);
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadScript = this.network?.loadScript ?? (() => Promise.resolve());
    this.resolveModuleUrl = this.network?.resolveModuleUrl ?? (() => "");
    return this;
  }

  /**
   * Normalizes a module export into an ESM-like namespace object.
   */
  createNamespace(value) {
    if (value && typeof value === "object" && value.__esModule) {
      return value;
    }
    const ns = { __esModule: true };
    if (value && typeof value === "object") {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          ns[key] = value[key];
        }
      }
    }
    if (!Object.prototype.hasOwnProperty.call(ns, "default")) {
      ns.default = value;
    }
    const base = ns.default;
    if (base && (typeof base === "object" || typeof base === "function")) {
      for (const key of Object.getOwnPropertyNames(base)) {
        if (
          key === "default" ||
          key === "__esModule" ||
          Object.prototype.hasOwnProperty.call(ns, key)
        ) {
          continue;
        }
        ns[key] = base[key];
      }
    }
    return ns;
  }

  /**
   * Ensures the provided namespace is exposed as a window global when needed.
   */
  async ensureGlobalFromNamespace(name, globalName, namespace) {
    if (!namespace) return;
    if (globalName && typeof window !== "undefined") {
      const existing = window[globalName];
      if (!existing || existing === namespace.default) {
        window[globalName] = namespace.default;
      }
    }
  }

  /**
   * Loads the configured CDN tools by resolving and injecting their globals.
   */
  async loadTools(tools) {
    this._ensureInitialized();
    return Promise.all(
      (tools || []).map(async (tool) => {
        const url = await this.resolveModuleUrl(tool);
        await this.loadScript(url);
        if (!window[tool.global]) {
          throw new Error(
            "Tool global not found after loading " + url + ": " + tool.global
          );
        }
        this.logClient("tool:loaded", { name: tool.name, url, global: tool.global });
      })
    );
  }

  /**
   * Exposes `createNamespace` through the public API for tooling helpers.
   */
  makeNamespace(globalObj) {
    return this.createNamespace(globalObj);
  }

  /**
   * Loads ad-hoc modules by URL, supporting both ESM and legacy globals.
   */
  async loadModules(modules) {
    this._ensureInitialized();
    const registry = {};
    for (const mod of modules) {
      const url = await this.resolveModuleUrl(mod);
      const format = (mod.format || mod.type || "global").toLowerCase();
      let namespace;
      if (format === "esm" || format === "module") {
        const moduleExports = await import(url);
        namespace = this.createNamespace(moduleExports);
        await this.ensureGlobalFromNamespace(mod.name, mod.global, namespace);
      } else {
        await this.loadScript(url);
        const globalObj = window[mod.global];
        if (!globalObj) {
          throw new Error(
            "Module global not found after loading " + url + ": " + mod.global
          );
        }
        namespace = this.createNamespace(globalObj);
      }
      registry[mod.name] = namespace;
      this.logClient("module:loaded", {
        name: mod.name,
        url,
        global: mod.global,
        format,
      });
    }
    return registry;
  }

  /**
   * Returns the public helpers that should be exposed through the bootstrap namespace.
   */
  get exports() {
    return {
      loadTools: this.loadTools.bind(this),
      makeNamespace: this.makeNamespace.bind(this),
      loadModules: this.loadModules.bind(this),
    };
  }

  /**
   * Installs the helpers into the namespace and registers the service globally.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.tools = exports;
    this.serviceRegistry.register("tools", exports, {
      folder: "services/cdn",
      domain: "cdn",
    }, ["logging"]);
    if (this.isCommonJs) {
      module.exports = exports;
    }
    return this;
  }

  /**
   * Validates and returns the namespace object provided via config.
   */
  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = ToolsLoaderService;
