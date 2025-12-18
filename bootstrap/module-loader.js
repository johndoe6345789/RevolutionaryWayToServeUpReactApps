(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});
  const isCommonJs = typeof module !== "undefined" && module.exports;

  const network = isCommonJs
    ? require("./cdn/network.js")
    : helpers.network || {};
  const tools = isCommonJs
    ? require("./cdn/tools.js")
    : helpers.tools || {};
  const dynamicModules = isCommonJs
    ? require("./cdn/dynamic-modules.js")
    : helpers.dynamicModules || {};
  const sourceUtils = isCommonJs
    ? require("./cdn/source-utils.js")
    : helpers.sourceUtils || {};
  const localLoader = isCommonJs
    ? require("./local/local-loader.js")
    : helpers.localLoader || {};

  const exports = Object.assign(
    {},
    network,
    tools,
    dynamicModules,
    sourceUtils,
    localLoader
  );

  helpers.moduleLoader = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
