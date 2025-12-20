const globalRoot = require("../../constants/global-root.js");
const ToolsLoaderConfig = require("../../configs/tools.js");

/**
 * Handles fetching globals/modules and normalizing them into namespace helpers.
 */
class ToolsLoaderService {
  constructor(config = new ToolsLoaderConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("ToolsLoaderService already initialized");
    }
    this.initialized = true;
    const dependencies = this.config.dependencies || {};
    this.namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging =
      dependencies.logging ??
      (this.isCommonJs ? require("../../cdn/logging.js") : this.helpers.logging);
    this.network =
      dependencies.network ??
      (this.isCommonJs ? require("../../cdn/network.js") : this.helpers.network);
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadScript = this.network?.loadScript ?? (() => Promise.resolve());
    this.resolveModuleUrl = this.network?.resolveModuleUrl ?? (() => "");
  }

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

  async ensureGlobalFromNamespace(name, globalName, namespace) {
    if (!namespace) return;
    if (globalName && typeof window !== "undefined") {
      const existing = window[globalName];
      if (!existing || existing === namespace.default) {
        window[globalName] = namespace.default;
      }
    }
  }

  async loadTools(tools) {
    if (!this.initialized) {
      throw new Error("ToolsLoaderService not initialized");
    }
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

  makeNamespace(globalObj) {
    return this.createNamespace(globalObj);
  }

  async loadModules(modules) {
    if (!this.initialized) {
      throw new Error("ToolsLoaderService not initialized");
    }
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

  get exports() {
    return {
      loadTools: this.loadTools.bind(this),
      makeNamespace: this.makeNamespace.bind(this),
      loadModules: this.loadModules.bind(this),
    };
  }

  install() {
    if (!this.initialized) {
      throw new Error("ToolsLoaderService not initialized");
    }
    const exports = this.exports;
    this.helpers.tools = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

module.exports = ToolsLoaderService;
