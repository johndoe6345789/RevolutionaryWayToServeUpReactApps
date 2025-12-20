const ModuleLoaderAggregator = require("./services/core/module-loader-service.js");
const ModuleLoaderConfig = require("./configs/module-loader.js");
const serviceRegistry = require("./services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const moduleLoader = new ModuleLoaderAggregator(
  new ModuleLoaderConfig({
    serviceRegistry,
    environmentRoot: rootHandler.root,
  })
);
moduleLoader.initialize();
moduleLoader.install();

module.exports = moduleLoader.exports;
