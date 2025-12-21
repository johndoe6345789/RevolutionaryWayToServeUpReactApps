const BaseHelper = require("../../helpers/base-helper.js");
const ProviderResolverConfig = require("./provider-resolver-config.js");

/**
 * Helps determine provider bases and candidate URLs for an icon module.
 */
class ProviderResolver extends BaseHelper {
  constructor(config = new ProviderResolverConfig()) {
    super(config);
    this.service = config.service;
  }

  /**
   * Sets up the Provider Resolver instance before it handles requests.
   */
  initialize() {
    if (this.initialized) {
      return this;
    }
    if (this.config.helperRegistry) {
      this._registerHelper("dynamicModulesProviderResolver", this, {
        folder: "services/cdn",
        domain: "cdn",
      });
    }
    this.initialized = true;
    return this;
  }

  /**
   * Resolve Bases for Provider Resolver.
   */
  resolveBases(rule) {
    const bases = [];
    const addBase = (value) => {
      if (!value) return;
      const normalized = this.service.normalizeProviderBase(value);
      if (!bases.includes(normalized)) bases.push(normalized);
    };
    const { provider, production_provider, ci_provider } = rule;
    const order = this.service.isCiLikeHost()
      ? [ci_provider, provider, production_provider]
      : [production_provider, provider, ci_provider];
    order.forEach(addBase);
    if (!bases.length) {
      addBase(provider || production_provider || this.service.getDefaultProviderBase());
    }
    if (rule.allowJsDelivr !== false) {
      this.service.getFallbackProviders().forEach(addBase);
    }
    return bases;
  }

  /**
   * Build Candidates for Provider Resolver.
   */
  buildCandidates(rule, icon, bases) {
    const pkg = rule.package || rule.prefix.replace(/\/\*?$/, "");
    const version = rule.version ? "@" + rule.version : "";
    const rawFile = (rule.filePattern || "{icon}.js").replace("{icon}", icon);
    const prefix = (rule.pathPrefix || "").replace(/^\/+|\/+$/g, "");
    const combinedPath = [prefix, rawFile].filter(Boolean).join("/");
    const seen = new Set();
    const candidates = [];
    bases.forEach((base) => {
      const packageRoot = base + pkg + version;
      if (combinedPath) {
        [
          `${packageRoot}/${combinedPath}`,
          `${packageRoot}/umd/${combinedPath}`,
          `${packageRoot}/dist/${combinedPath}`,
        ].forEach((candidate) => this._addCandidate(candidate, candidates, seen));
      } else {
        this._addCandidate(packageRoot, candidates, seen);
      }
    });
    return candidates;
  }

  /**
   * Performs the internal add candidate step for Provider Resolver.
   */
  _addCandidate(candidate, candidates, seen) {
    if (!candidate || seen.has(candidate)) return;
    seen.add(candidate);
    candidates.push(candidate);
  }
}

module.exports = ProviderResolver;
