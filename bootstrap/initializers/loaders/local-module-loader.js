const LocalModuleLoaderService = require("../services/local/local-module-loader-service.js");
const LocalModuleLoaderConfig = require("../configs/local-module-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.getNamespace();
const globalScope = rootHandler.root;
const fetchImpl =
  typeof globalScope.fetch === "function" ? globalScope.fetch.bind(globalScope) : undefined;
const localModuleLoaderService = new LocalModuleLoaderService(
  new LocalModuleLoaderConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
  })
);
localModuleLoaderService.initialize();
localModuleLoaderService.install();

module.exports = localModuleLoaderService.exports;
