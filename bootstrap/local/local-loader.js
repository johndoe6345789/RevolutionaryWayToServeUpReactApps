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
  const sassCompiler = isCommonJs
    ? require("./sass-compiler.js")
    : helpers.sassCompiler;
  const tsxCompiler = isCommonJs
    ? require("./tsx-compiler.js")
    : helpers.tsxCompiler;
  const localPaths = isCommonJs
    ? require("./local-paths.js")
    : helpers.localPaths;
  const moduleLoader = isCommonJs
    ? require("./local-module-loader.js")
    : helpers.localModuleLoader;

  const { logClient = () => {} } = logging || {};
  const { loadDynamicModule = () => Promise.reject(new Error("dynamic loader missing")) } =
    dynamicModules || {};

  const {
    compileSCSS,
    injectCSS
  } = sassCompiler || {};
  const {
    compileTSX,
    transformSource,
    executeModuleSource
  } = tsxCompiler || {};
  const {
    isLocalModule,
    normalizeDir,
    makeAliasKey,
    getModuleDir
  } = localPaths || {};
  const {
    createLocalModuleLoader,
    fetchLocalModuleSource
  } = moduleLoader || {};

  function getModuleExport(mod, name) {
    if (!mod) return null;
    if (Object.prototype.hasOwnProperty.call(mod, name)) {
      return mod[name];
    }
    if (mod.default && Object.prototype.hasOwnProperty.call(mod.default, name)) {
      return mod.default[name];
    }
    return null;
  }

  function frameworkRender(config, registry, App) {
    const rootId = config.render?.rootId || "root";
    const rootEl = document.getElementById(rootId);
    if (!rootEl) throw new Error("Root element not found: #" + rootId);

    const domModuleName = config.render?.domModule;
    const reactModuleName = config.render?.reactModule;
    const domModule = domModuleName ? registry[domModuleName] : null;
    const reactModule = reactModuleName ? registry[reactModuleName] : null;
    if (!domModule) throw new Error("DOM render module missing: " + domModuleName);
    if (!reactModule) throw new Error("React module missing: " + reactModuleName);

    const createRootFn = getModuleExport(domModule, config.render.createRoot);
    if (!createRootFn) {
      throw new Error("createRoot not found: " + config.render.createRoot);
    }

    const root = createRootFn(rootEl);
    const renderMethod = config.render.renderMethod || "render";
    if (typeof root[renderMethod] !== "function") {
      throw new Error("Render method not found: " + renderMethod);
    }

    const createElementFn = getModuleExport(reactModule, "createElement");
    if (!createElementFn) {
      throw new Error("createElement not found on React module");
    }
    root[renderMethod](createElementFn(App));
  }

  function createRequire(
    registry,
    config,
    entryDir = "",
    localModuleLoader,
    dynamicModuleLoader
  ) {
    let resolvedEntryDir = "";
    let resolvedDynamicModuleLoader = dynamicModuleLoader;

    if (typeof entryDir === "function" && arguments.length === 3) {
      resolvedDynamicModuleLoader = entryDir;
    } else {
      resolvedEntryDir = entryDir || "";
    }

    resolvedDynamicModuleLoader = resolvedDynamicModuleLoader || loadDynamicModule;

    function require(name) {
      if (registry[name]) return registry[name];
      throw new Error(
        "Module not yet loaded: " +
          name +
          " (use a preload step via requireAsync for dynamic modules)"
      );
    }

    async function requireAsync(name, baseDir) {
      if (registry[name]) return registry[name];
      if (localModuleLoader && isLocalModule(name)) {
        return localModuleLoader(
          name,
          baseDir || resolvedEntryDir,
          require,
          registry
        );
      }
      const dynRules = config.dynamicModules || [];
      if (dynRules.some((r) => name.startsWith(r.prefix))) {
        return resolvedDynamicModuleLoader(name, config, registry);
      }
      throw new Error("Module not registered: " + name);
    }

    require._async = requireAsync;
    return require;
  }

  const exports = Object.assign(
    {},
    sassCompiler,
    tsxCompiler,
    localPaths,
    moduleLoader,
    {
      frameworkRender,
      createRequire
    }
  );

  helpers.localLoader = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
