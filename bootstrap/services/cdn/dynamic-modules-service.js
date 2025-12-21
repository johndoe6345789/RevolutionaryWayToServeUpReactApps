const BaseService = require("../../interfaces/base-service.js");
const DynamicModulesConfig = require("../../configs/cdn/dynamic-modules.js");
const ProviderResolver = require("./dynamic-modules/provider-resolver.js");
const ProviderResolverConfig = require("./dynamic-modules/provider-resolver-config.js");
const DynamicModuleFetcher = require("./dynamic-modules/module-fetcher.js");
const DynamicModuleFetcherConfig = require("./dynamic-modules/module-fetcher-config.js");
const helperRegistry = require("../../registries/helper-registry-instance.js");

/**
 * Resolves and loads icon-specific dynamic modules from configured providers.
 */
class DynamicModulesService extends BaseService {
  constructor(config = new DynamicModulesConfig()) {
    super(config);
  }

  /**
   * Collects dependencies, registers helpers, and prepares CDN helpers for lookup.
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
    const net = this.network || {};
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.loadScript = net.loadScript || (() => Promise.resolve());
    this.probeUrl = net.probeUrl || (() => false);
    this.normalizeProviderBase = net.normalizeProviderBase || (() => "");
    this.getFallbackProviders = net.getFallbackProviders || (() => []);
    this.getDefaultProviderBase = net.getDefaultProviderBase || (() => "");
    this.isCiLikeHost = net.isCiLikeHost || (() => false);
    this.providerResolver = new ProviderResolver(
      new ProviderResolverConfig({
        service: this,
        helperRegistry,
      })
    ).initialize();
    this.moduleFetcher = new DynamicModuleFetcher(
      new DynamicModuleFetcherConfig({
        service: this,
        helperRegistry,
      })
    ).initialize();
    return this;
  }

  /**
   * Converts legacy CommonJS/UMD exports into an ESM-like namespace object.
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
   * Loads an icon-specific module by resolving the configured rule set and probing providers.
   */
  async loadDynamicModule(name, config, registry) {
    this._ensureInitialized();
    const rule = this._resolveRule(name, config);
    const icon = name.slice(rule.prefix.length);
    const bases = this.providerResolver.resolveBases(rule);
    const urls = this.providerResolver.buildCandidates(rule, icon, bases);
    const namespace = await this.moduleFetcher.fetchNamespace(rule, icon, registry, urls);
    registry[name] = namespace;
    return namespace;
  }

  /**
   * Performs the internal resolve rule step for Dynamic Modules Service.
   */
  _resolveRule(name, config) {
    const dynRules = config.dynamicModules || [];
    const rule = dynRules.find((r) => name.startsWith(r.prefix));
    if (!rule) {
      throw new Error("No dynamic rule for module: " + name);
    }
    return rule;
  }

  /**
   * Exposes the helper entrypoints that should be installed into the helpers namespace.
   */
  get exports() {
    return {
      loadDynamicModule: this.loadDynamicModule.bind(this),
    };
  }

  /**
   * Installs the helper into the namespace and registers it with the service registry.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.dynamicModules = exports;
    this.serviceRegistry.register("dynamicModules", exports, {
      folder: "services/cdn",
      domain: "cdn",
    }, ["logging"]);
    if (this.isCommonJs) {
      module.exports = exports;
    }
    return this;
  }

  /**
   * Ensures a namespace object was supplied via configuration.
   */
  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = DynamicModulesService;
