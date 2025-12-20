const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;
const TsxCompilerConfig = require("../configs/tsx-compiler.js");

class TsxCompilerService {
  constructor(config = new TsxCompilerConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("TsxCompilerService already initialized");
    }
    this.initialized = true;
    const dependencies = this.config.dependencies || {};
    this.global = globalRoot;
    this.namespace = this.global.__rwtraBootstrap || (this.global.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.logging =
      dependencies.logging ??
      (this.isCommonJs ? require("../cdn/logging.js") : this.helpers.logging);
    this.sourceUtils =
      dependencies.sourceUtils ??
      (this.isCommonJs ? require("../cdn/source-utils.js") : this.helpers.sourceUtils);
    this.logClient = (this.logging && this.logging.logClient) || (() => {});
    this.preloadModulesFromSource = this.sourceUtils?.preloadModulesFromSource;
    this.moduleContextStack = [];
  }

  transformSource(source, filePath) {
    const Babel = this.global.Babel;
    if (!Babel) {
      throw new Error("Babel is unavailable when transforming TSX");
    }
    return Babel.transform(source, {
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
    if (typeof globalRoot.fetch !== "function") {
      throw new Error("Fetch is unavailable when compiling TSX");
    }
    const res = await globalRoot.fetch(entryFile, { cache: "no-store" });
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
    if (!this.initialized) {
      throw new Error("TsxCompilerService not initialized");
    }
    const exports = this.exports;
    this.helpers.tsxCompiler = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

const tsxCompilerService = new TsxCompilerService();
tsxCompilerService.initialize();
tsxCompilerService.install();
