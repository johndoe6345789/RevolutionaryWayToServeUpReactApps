const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;
const DynamicModulesConfig = require("../configs/dynamic-modules.js");

class DynamicModulesService {
  constructor(config = new DynamicModulesConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("DynamicModulesService already initialized");
    }
    this.initialized = true;
    const dependencies = this.config.dependencies || {};
    this.namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging =
      dependencies.logging ??
      (this.isCommonJs ? require("./logging.js") : this.helpers.logging);
    this.network =
      dependencies.network ??
      (this.isCommonJs ? require("./network.js") : this.helpers.network);
    const net = this.network || {};
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadScript = net.loadScript || (() => Promise.resolve());
    this.probeUrl = net.probeUrl || (() => false);
    this.normalizeProviderBase = net.normalizeProviderBase || (() => "");
    this.getFallbackProviders = net.getFallbackProviders || (() => []);
    this.getDefaultProviderBase = net.getDefaultProviderBase || (() => "");
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

  async loadDynamicModule(name, config, registry) {
    if (!this.initialized) {
      throw new Error("DynamicModulesService not initialized");
    }
    const dynRules = config.dynamicModules || [];
    const rule = dynRules.find((r) => name.startsWith(r.prefix));
    if (!rule) {
      throw new Error("No dynamic rule for module: " + name);
    }

    const icon = name.slice(rule.prefix.length);
    const bases = [];
    const addBase = (b) => {
      if (!b) return;
      const normalized = this.normalizeProviderBase(b);
      if (!bases.includes(normalized)) bases.push(normalized);
    };
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isCiLike = host === "127.0.0.1" || host === "localhost";
    const addProvidersInOrder = (providers) => {
      for (const prov of providers) {
        addBase(prov);
      }
    };
    if (isCiLike) {
      addProvidersInOrder([
        rule.ci_provider,
        rule.provider,
        rule.production_provider,
      ]);
    } else {
      addProvidersInOrder([
        rule.production_provider,
        rule.provider,
        rule.ci_provider,
      ]);
    }
    if (!bases.length) {
      addBase(rule.provider || rule.production_provider || this.getDefaultProviderBase());
    }
    if (rule.allowJsDelivr !== false) {
      for (const fallback of this.getFallbackProviders()) {
        addBase(fallback);
      }
    }

    const pkg = rule.package || rule.prefix.replace(/\/\*?$/, "");
    const version = rule.version ? "@" + rule.version : "";
    const rawFile = (rule.filePattern || "{icon}.js").replace("{icon}", icon);
    const prefix = (rule.pathPrefix || "").replace(/^\/+|\/+$/g, "");
    const combinedPath = [prefix, rawFile].filter(Boolean).join("/");

    const candidates = [];
    for (const base of bases) {
      const packageRoot = base + pkg + version;
      if (combinedPath) {
        candidates.push(packageRoot + "/" + combinedPath);
        candidates.push(packageRoot + "/umd/" + combinedPath);
        candidates.push(packageRoot + "/dist/" + combinedPath);
      } else {
        candidates.push(packageRoot);
      }
    }

    const seen = new Set();
    const urls = [];
    for (const c of candidates) {
      if (!seen.has(c)) {
        seen.add(c);
        urls.push(c);
      }
    }

    let foundUrl = null;
    for (const url of urls) {
      if (await this.probeUrl(url)) {
        foundUrl = url;
        break;
      }
    }

    if (!foundUrl) {
      throw new Error(
        "Unable to resolve icon module " +
          name +
          " (tried: " +
          urls.join(", ") +
          ")"
      );
    }

    const format = (rule.format || rule.type || "global").toLowerCase();
    let namespace;
    if (format === "esm" || format === "module") {
      const moduleExports = await import(foundUrl);
      namespace = this.createNamespace(moduleExports);
      this.logClient("dynamic-module:loaded", {
        name,
        url: foundUrl,
        format,
      });
      registry[name] = namespace;
      return registry[name];
    }

    await this.loadScript(foundUrl);

    const globalName = (rule.globalPattern || "{icon}").replace("{icon}", icon);
    const globalObj = globalName.includes(".")
      ? globalName.split(".").reduce((obj, part) => (obj ? obj[part] : undefined), window)
      : window[globalName];

    if (!globalObj) {
      throw new Error(
        "Global for icon " + name + " not found: " + globalName
      );
    }

    namespace = this.createNamespace(globalObj);
    registry[name] = namespace;
    this.logClient("dynamic-module:loaded", {
      name,
      url: foundUrl,
      global: globalName,
      format,
    });
    return registry[name];
  }

  get exports() {
    return {
      loadDynamicModule: this.loadDynamicModule.bind(this),
    };
  }

  install() {
    if (!this.initialized) {
      throw new Error("DynamicModulesService not initialized");
    }
    const exports = this.exports;
    this.helpers.dynamicModules = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

const dynamicModulesService = new DynamicModulesService();
dynamicModulesService.initialize();
dynamicModulesService.install();
