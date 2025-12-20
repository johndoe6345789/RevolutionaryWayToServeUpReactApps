const LocalPathsConfig = require("../../configs/local-paths.js");
const { localModuleExtensions: LOCAL_MODULE_EXTENSIONS } =
  require("../../constants/common.js");
const globalRoot = require("../../constants/global-root.js");


/**
 * Normalizes local module paths and enumerates candidate URLs/extensions.
 */
class LocalPathsService {
  constructor(config = new LocalPathsConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("LocalPathsService already initialized");
    }
    this.initialized = true;
    this.LOCAL_MODULE_EXTENSIONS = LOCAL_MODULE_EXTENSIONS;
    this.namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for LocalPathsService");
    }
  }

  isLocalModule(name) {
    return name.startsWith(".") || name.startsWith("/");
  }

  normalizeDir(dir) {
    if (!dir) return "";
    return dir.replace(/^\/+/, "").replace(/\/+$/, "");
  }

  makeAliasKey(name, baseDir) {
    return this.normalizeDir(baseDir) + "|" + name;
  }

  resolveLocalModuleBase(name, baseDir, currentHref) {
    const normalizedBase = this.normalizeDir(baseDir);
    const href =
      currentHref ||
      (typeof location !== "undefined" ? location.href : "http://localhost/");
    const baseUrl = new URL(
      normalizedBase ? `${normalizedBase}/` : "./",
      href
    );
    const resolvedUrl = new URL(name, baseUrl);
    return resolvedUrl.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  }

  getModuleDir(filePath) {
    const idx = filePath.lastIndexOf("/");
    return idx === -1 ? "" : filePath.slice(0, idx);
  }

  hasKnownExtension(path) {
    return /\.(tsx|ts|jsx|js)$/.test(path);
  }

  getCandidateLocalPaths(basePath) {
    const normalizedBase = basePath.replace(/\/+$/, "");
    const seen = new Set();
    const candidates = [];

    const add = (candidate) => {
      if (!candidate) return;
      if (seen.has(candidate)) return;
      seen.add(candidate);
      candidates.push(candidate);
    };

    add(normalizedBase);
    if (!this.hasKnownExtension(normalizedBase)) {
      for (const ext of this.LOCAL_MODULE_EXTENSIONS) {
        add(normalizedBase + ext);
      }
      for (const ext of this.LOCAL_MODULE_EXTENSIONS) {
        add(`${normalizedBase}/index${ext}`);
      }
    }

    return candidates;
  }

  get exports() {
    return {
      isLocalModule: this.isLocalModule.bind(this),
      normalizeDir: this.normalizeDir.bind(this),
      makeAliasKey: this.makeAliasKey.bind(this),
      resolveLocalModuleBase: this.resolveLocalModuleBase.bind(this),
      getModuleDir: this.getModuleDir.bind(this),
      hasKnownExtension: this.hasKnownExtension.bind(this),
      getCandidateLocalPaths: this.getCandidateLocalPaths.bind(this),
    };
  }

  install() {
    if (!this.initialized) {
      throw new Error("LocalPathsService not initialized");
    }
    const exports = this.exports;
    this.helpers.localPaths = exports;
    this.serviceRegistry.register("localPaths", exports, {
      folder: "services/local",
      domain: "local",
    });
    if (typeof module !== "undefined" && module.exports) {
      module.exports = exports;
    }
  }
}

module.exports = LocalPathsService;
