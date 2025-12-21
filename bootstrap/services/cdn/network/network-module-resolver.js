const BaseService = require("../../base-service.js");
const NetworkModuleResolverConfig = require("../../../configs/network-module-resolver.js");

class NetworkModuleResolver extends BaseService {
  constructor(config = new NetworkModuleResolverConfig()) {
    super(config);
  }

  initialize() {
    this._ensureNotInitialized();
    this._applyConfig();
    this._markInitialized();
    return this;
  }

  _applyConfig() {
    const config = this.config;
    this.providerService = config.providerService;
    this.probeService = config.probeService;
    this.logClient = config.logClient;
  }

  async resolveModuleUrl(mod) {
    if (mod.url) return mod.url;

    const bases = this.providerService.collectBases(mod);
    const pkgName = mod.package || mod.name;
    const versionSegment = mod.version ? "@" + mod.version : "";
    const file = (mod.file || "").replace(/^\/+/, "");
    const pathPrefix = (mod.pathPrefix || "").replace(/^\/+|\/+$/g, "");
    const explicitPath = mod.path ? mod.path.replace(/^\/+/, "") : "";
    const combinedPath = [pathPrefix, file].filter(Boolean).join("/");

    const candidates = [];
    for (const base of bases) {
      const packageRoot = base + pkgName + versionSegment;
      if (explicitPath) {
        candidates.push(packageRoot + "/" + explicitPath);
      } else if (combinedPath) {
        candidates.push(packageRoot + "/" + combinedPath);
        candidates.push(packageRoot + "/umd/" + combinedPath);
        candidates.push(packageRoot + "/dist/" + combinedPath);
      } else {
        candidates.push(packageRoot);
      }
    }

    const seen = new Set();
    const unique = [];
    for (const c of candidates) {
      if (!seen.has(c)) {
        seen.add(c);
        unique.push(c);
      }
    }

    for (const url of unique) {
      if (await this.probeService.probeUrl(url)) {
        this.logClient("resolve:success", { name: mod.name, url });
        return url;
      }
    }

    this.logClient("resolve:fail", { name: mod.name, tried: unique });

    throw new Error(
      "Unable to resolve URL for module " +
        (mod.name || "<unnamed>") +
        " (tried: " +
        unique.join(", ") +
        ")"
    );
  }
}

module.exports = NetworkModuleResolver;
