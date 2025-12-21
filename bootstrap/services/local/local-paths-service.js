const BaseService = require("../base-service.js");
const LocalPathsConfig = require("../../configs/local-paths.js");
const { localModuleExtensions: LOCAL_MODULE_EXTENSIONS } =
  require("../../constants/common.js");


/**
 * Normalizes local module paths and enumerates candidate URLs/extensions.
 */
class LocalPathsService extends BaseService {
  constructor(config = new LocalPathsConfig()) { super(config); }

  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    this.LOCAL_MODULE_EXTENSIONS = LOCAL_MODULE_EXTENSIONS;
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.serviceRegistry = this._requireServiceRegistry();
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
    this._ensureInitialized();
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

  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = LocalPathsService;
