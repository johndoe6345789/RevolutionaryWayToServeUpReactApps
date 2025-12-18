(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;

  function collectDynamicModuleImports(source, config) {
    const dynRules = config.dynamicModules || [];
    if (!dynRules.length) return [];
    const prefixes = dynRules.map((r) => r.prefix);
    const results = new Set();

    function maybeAdd(spec) {
      if (!spec) return;
      for (const p of prefixes) {
        if (spec.startsWith(p)) {
          results.add(spec);
          break;
        }
      }
    }

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

  async function preloadDynamicModulesFromSource(source, requireFn, config) {
    if (!requireFn || typeof requireFn._async !== "function") {
      return;
    }

    const toPreload = collectDynamicModuleImports(source, config);
    if (!toPreload.length) return;

    await Promise.all(
      toPreload.map((name) =>
        requireFn
          ._async(name)
          .catch((err) => console.warn("Preload failed for", name, err))
      )
    );
  }

  function collectModuleSpecifiers(source) {
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

  async function preloadModulesFromSource(source, requireFn, baseDir = "") {
    if (!requireFn || typeof requireFn._async !== "function") return;
    const specs = collectModuleSpecifiers(source);
    if (!specs.length) return;

    await Promise.all(
      specs.map((name) =>
        requireFn._async(name, baseDir).catch((err) => {
          console.warn("Preload failed for", name, err);
        })
      )
    );
  }

  const exports = {
    collectDynamicModuleImports,
    preloadDynamicModulesFromSource,
    collectModuleSpecifiers,
    preloadModulesFromSource
  };

  helpers.sourceUtils = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
