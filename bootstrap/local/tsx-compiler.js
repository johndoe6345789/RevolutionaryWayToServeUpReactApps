(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs
    ? require("../cdn/logging.js")
    : helpers.logging;
  const sourceUtils = isCommonJs
    ? require("../cdn/source-utils.js")
    : helpers.sourceUtils;

  const { logClient = () => {} } = logging || {};
  const {
    preloadModulesFromSource = () => Promise.resolve()
  } = sourceUtils || {};

  function transformSource(source, filePath) {
    return Babel.transform(source, {
      filename: filePath,
      presets: [
        ["typescript", { allExtensions: true, isTSX: true }],
        "react",
        "env"
      ],
      sourceMaps: "inline"
    }).code;
  }

  function executeModuleSource(source, filePath, moduleDir, requireFn) {
    const compiled = transformSource(source, filePath);
    const exports = {};
    const module = { exports };

    moduleContextStack.push({ path: filePath, dir: moduleDir });
    try {
      new Function("require", "exports", "module", compiled)(
        requireFn,
        exports,
        module
      );
    } finally {
      moduleContextStack.pop();
    }

    return module.exports.default || module.exports;
  }

  const moduleContextStack = [];

  async function compileTSX(entryFile, requireFn, entryDir = "") {
    const res = await fetch(entryFile, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + entryFile);
    const tsxCode = await res.text();

    await preloadModulesFromSource(tsxCode, requireFn, entryDir);

    const compiled = executeModuleSource(tsxCode, entryFile, entryDir, requireFn);
    logClient("tsx:compiled", { entryFile, entryDir });
    return compiled;
  }

  const exports = {
    compileTSX,
    transformSource,
    executeModuleSource,
    moduleContextStack
  };

  helpers.tsxCompiler = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
