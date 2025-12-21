const BaseService = require("../base-service.js");
const TsxCompilerConfig = require("../../configs/tsx-compiler.js");

/**
 * Transforms and executes TSX sources using Babel and inlined execution.
 */
class TsxCompilerService extends BaseService {
  constructor(config = new TsxCompilerConfig()) { super(config); }

  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    this.serviceRegistry = this._requireServiceRegistry();
    const dependencies = this.config.dependencies || {};
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging =
      dependencies.logging ??
      (this.isCommonJs ? require("../../cdn/logging.js") : this.helpers.logging);
    this.sourceUtils =
      dependencies.sourceUtils ??
      (this.isCommonJs ? require("../../cdn/source-utils.js") : this.helpers.sourceUtils);
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.preloadModulesFromSource = this.sourceUtils?.preloadModulesFromSource;
    this.moduleContextStack = [];
    this.fetchImpl = this.config.fetch ?? dependencies.fetch;
    this.Babel = this.config.Babel ?? dependencies.Babel;
  }

  transformSource(source, filePath) {
    if (!this.Babel) {
      throw new Error("Babel is unavailable when transforming TSX");
    }
    return this.Babel.transform(source, {
      filename: filePath,
      presets: [
        ["typescript", { allExtensions: true, isTSX: true }],
        "react",
        "env",
      ],
      sourceMaps: "inline",
    }).code;
  }

  executeModuleSource(source, filePath, moduleDir, requireFn) {
    const compiled = this.transformSource(source, filePath);
    const exports = {};
    const module = { exports };

    this.moduleContextStack.push({ path: filePath, dir: moduleDir });
    try {
      new Function("require", "exports", "module", compiled)(
        requireFn,
        exports,
        module
      );
    } finally {
      this.moduleContextStack.pop();
    }

    return module.exports.default || module.exports;
  }

  async compileTSX(entryFile, requireFn, entryDir = "") {
    if (typeof this.fetchImpl !== "function") {
      throw new Error("Fetch is unavailable when compiling TSX");
    }
    const res = await this.fetchImpl(entryFile, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + entryFile);
    const tsxCode = await res.text();

    if (this.preloadModulesFromSource) {
      await this.preloadModulesFromSource(tsxCode, requireFn, entryDir);
    }

    const compiled = this.executeModuleSource(tsxCode, entryFile, entryDir, requireFn);
    this.logClient("tsx:compiled", { entryFile, entryDir });
    return compiled;
  }

  get exports() {
    return {
      compileTSX: this.compileTSX.bind(this),
      transformSource: this.transformSource.bind(this),
      executeModuleSource: this.executeModuleSource.bind(this),
      moduleContextStack: this.moduleContextStack,
    };
  }

  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.tsxCompiler = exports;
    this.serviceRegistry.register("tsxCompiler", exports, {
      folder: "services/local",
      domain: "local",
    });
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }

  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = TsxCompilerService;
