const SourceUtilsConfig = require("../configs/source-utils.js");
const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;

class SourceUtilsService {
  constructor(config = new SourceUtilsConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("SourceUtilsService already initialized");
    }
    this.initialized = true;
    this.namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
  }

  collectDynamicModuleImports(source, config) {
    const dynRules = config.dynamicModules || [];
    if (!dynRules.length) return [];
    const prefixes = dynRules.map((r) => r.prefix);
    const results = new Set();

    const maybeAdd = (spec) => {
      if (!spec) return;
      for (const p of prefixes) {
        if (spec.startsWith(p)) {
          results.add(spec);
          break;
        }
      }
    };

    const importRe = /import\s+(?:[^'"]+from\s+)?["']([^"']+)["']/g;
    let m;
    while ((m = importRe.exec(source))) {
      maybeAdd(m[1]);
    }

    const requireRe = /require\(\s*["']([^"']+)["']\s*\)/g;
    while ((m = requireRe.exec(source))) {
      maybeAdd(m[1]);
    }

    return Array.from(results);
  }

  async preloadDynamicModulesFromSource(source, requireFn, config) {
    if (!requireFn || typeof requireFn._async !== "function") {
      return;
    }

    const toPreload = this.collectDynamicModuleImports(source, config);
    if (!toPreload.length) return;

    await Promise.all(
      toPreload.map((name) =>
        requireFn
          ._async(name)
          .catch((err) => console.warn("Preload failed for", name, err))
      )
    );
  }

  collectModuleSpecifiers(source) {
    const specs = new Set();
    const importRe = /import\s+(?:[^'"]+from\s+)?["']([^"']+)["']/g;
    let m;
    while ((m = importRe.exec(source))) {
      specs.add(m[1]);
    }

    const requireRe = /require\(\s*["']([^"']+)["']\s*\)/g;
    while ((m = requireRe.exec(source))) {
      specs.add(m[1]);
    }

    return Array.from(specs);
  }

  async preloadModulesFromSource(source, requireFn, baseDir = "") {
    if (!requireFn || typeof requireFn._async !== "function") return;
    const specs = this.collectModuleSpecifiers(source);
    if (!specs.length) return;

    const results = await Promise.allSettled(
      specs.map((name) => requireFn._async(name, baseDir))
    );

    const failures = results
      .map((res, idx) => [res, specs[idx]])
      .filter(([res]) => res.status === "rejected")
      .map(([res, name]) => ({ name, error: res.reason }));

    if (failures.length) {
      const messages = failures
        .map(({ name, error }) => `${name}: ${error?.message || error}`)
        .join(", ");
      throw new Error(
        `Failed to preload module(s): ${messages}. Check file paths and dynamic module rules.`
      );
    }
  }

  get exports() {
    return {
      collectDynamicModuleImports: this.collectDynamicModuleImports.bind(this),
      preloadDynamicModulesFromSource: this.preloadDynamicModulesFromSource.bind(this),
      collectModuleSpecifiers: this.collectModuleSpecifiers.bind(this),
      preloadModulesFromSource: this.preloadModulesFromSource.bind(this),
    };
  }

  install() {
    if (!this.initialized) {
      throw new Error("SourceUtilsService not initialized");
    }
    const exports = this.exports;
    this.helpers.sourceUtils = exports;
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }
}

const sourceUtilsService = new SourceUtilsService();
sourceUtilsService.initialize();
sourceUtilsService.install();
