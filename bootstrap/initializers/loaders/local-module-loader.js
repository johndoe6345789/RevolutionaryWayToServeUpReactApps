/**
 * Initializes the local module loader helper with document and fetch bindings for in-browser modules.
 */
const LocalModuleLoaderService = require("../../services/local/local-module-loader-service.js");
const LocalModuleLoaderConfig = require("../../configs/local/local-module-loader.js");
const BaseEntryPoint = require("../../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: LocalModuleLoaderService,
  ConfigClass: LocalModuleLoaderConfig,
  configFactory: ({ namespace, root }) => ({
    namespace,
    fetch: typeof root.fetch === "function" ? root.fetch.bind(root) : undefined,
  }),
});
const localModuleLoaderService = entrypoint.run();

module.exports = localModuleLoaderService.exports;
