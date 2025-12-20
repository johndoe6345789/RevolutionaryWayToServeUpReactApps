const BaseService = require("../base-service.js");
const SourceUtilsConfig = require("../../configs/source-utils.js");

/**
 * Parses source files for module specifiers and preloads dynamic dependencies.
 */
class SourceUtilsService extends BaseService {
  constructor(config = new SourceUtilsConfig()) {
    super(config);
  }

  /**
   * Ensures the namespace is available and registers this service globally.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    this.namespace = this._resolveNamespace();
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.serviceRegistry = this._requireServiceRegistry();
  }

  /**
   * Extracts dynamic module import specifiers that match configured prefixes.
   */
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

  /**
   * Preloads dynamic modules that were discovered inside a source file.
   */
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

  /**
   * Returns every module specifier referenced in the provided source string.
   */
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

  /**
   * Preloads both static and dynamic specifiers found in a file via requireAsync.
   */
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

  /**
   * Exposes the helper functions for module parsing and preloading.
   */
  get exports() {
    return {
      collectDynamicModuleImports: this.collectDynamicModuleImports.bind(this),
      preloadDynamicModulesFromSource: this.preloadDynamicModulesFromSource.bind(this),
      collectModuleSpecifiers: this.collectModuleSpecifiers.bind(this),
      preloadModulesFromSource: this.preloadModulesFromSource.bind(this),
    };
  }

  /**
   * Registers the service outputs and installs them into the helpers namespace.
   */
  install() {
    this._ensureInitialized();
    const exports = this.exports;
    this.helpers.sourceUtils = exports;
    this.serviceRegistry.register("sourceUtils", exports, {
      folder: "services/cdn",
      domain: "cdn",
    });
    if (this.isCommonJs) {
      module.exports = exports;
    }
  }

  /**
   * Validates that a namespace object was supplied through config.
   */
  _resolveNamespace() {
    return super._resolveNamespace();
  }
}

module.exports = SourceUtilsService;
