(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});
  const isCommonJs = typeof module !== "undefined" && module.exports;

  const logging = isCommonJs
    ? require("../cdn/logging.js")
    : helpers.logging;
  const dynamicModules = isCommonJs
    ? require("../cdn/dynamic-modules.js")
    : helpers.dynamicModules;
  const sourceUtils = isCommonJs
    ? require("../cdn/source-utils.js")
    : helpers.sourceUtils;
  const tsxCompiler = isCommonJs
    ? require("./tsx-compiler.js")
    : helpers.tsxCompiler;
  const localPaths = isCommonJs
    ? require("./local-paths.js")
    : helpers.localPaths;

  const { logClient = () => {} } = logging || {};
  const { loadDynamicModule = () => Promise.reject(new Error("dynamic loader missing")) } =
    dynamicModules || {};
  const {
    preloadModulesFromSource = () => Promise.resolve()
  } = sourceUtils || {};
  const {
    executeModuleSource = () => {},
    transformSource = () => "",
  } = tsxCompiler || {};
  const {
    normalizeDir = () => "",
    makeAliasKey = () => "",
    resolveLocalModuleBase = () => "",
    getModuleDir = () => "",
    getCandidateLocalPaths = () => []
  } = localPaths || {};

  function createLocalModuleLoader(entryDir) {
    const moduleCache = new Map();
    const modulePromises = new Map();
    const aliasToCanonical = new Map();

    return async function loadLocalModule(name, baseDir, requireFn, registry) {
      const normalizedBase = normalizeDir(baseDir || entryDir || "");
      const aliasKey = makeAliasKey(name, normalizedBase);
      const existingCanonical = aliasToCanonical.get(aliasKey);

      if (existingCanonical && registry[existingCanonical]) {
        const cached = registry[existingCanonical];
        registry[name] = cached;
        return cached;
      }

      const basePath = resolveLocalModuleBase(name, normalizedBase);
      const { source, resolvedPath } = await fetchLocalModuleSource(basePath);
      const moduleDir = getModuleDir(resolvedPath);
      aliasToCanonical.set(aliasKey, resolvedPath);

      if (moduleCache.has(resolvedPath)) {
        const cached = moduleCache.get(resolvedPath);
        registry[resolvedPath] = cached;
        registry[name] = cached;
        return cached;
      }

      if (modulePromises.has(resolvedPath)) {
        const pending = await modulePromises.get(resolvedPath);
        registry[resolvedPath] = pending;
        registry[name] = pending;
        return pending;
      }

      const loadPromise = (async () => {
        await preloadModulesFromSource(source, requireFn, moduleDir);
        const moduleExports = executeModuleSource(
          source,
          resolvedPath,
          moduleDir,
          requireFn
        );
        moduleCache.set(resolvedPath, moduleExports);
        registry[resolvedPath] = moduleExports;
        return moduleExports;
      })();

      modulePromises.set(resolvedPath, loadPromise);
      try {
        const result = await loadPromise;
        registry[name] = result;
        return result;
      } finally {
        modulePromises.delete(resolvedPath);
      }
    };
  }

  async function fetchLocalModuleSource(basePath) {
    const candidates = getCandidateLocalPaths(basePath);

    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate, { cache: "no-store" });
        if (res.ok) {
          return {
            source: await res.text(),
            resolvedPath: candidate
          };
        }
      } catch (err) {
        // ignore and try next candidate
      }
    }

    logClient("local-module:failed", { basePath, candidates });
    throw new Error(
      "Failed to load local module: " +
        basePath +
        " (tried: " +
        candidates.join(", ") +
        ")"
    );
  }

  const exports = {
    createLocalModuleLoader,
    fetchLocalModuleSource
  };

  helpers.localModuleLoader = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
