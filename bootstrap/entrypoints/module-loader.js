const ModuleLoaderAggregator = require("../services/core/module-loader-service.js");
const ModuleLoaderConfig = require("../configs/module-loader.js");
const BaseEntryPoint = require("./base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: ModuleLoaderAggregator,
  ConfigClass: ModuleLoaderConfig,
  configFactory: ({ root }) => ({ environmentRoot: root }),
});
const moduleLoader = entrypoint.run();

module.exports = moduleLoader.exports;
