const ModuleLoaderAggregator = require("./services/core/module-loader-service.js");
const ModuleLoaderConfig = require("./configs/module-loader.js");
const serviceRegistry = require("./services/service-registry-instance.js");

const moduleLoader = new ModuleLoaderAggregator(
  new ModuleLoaderConfig({ serviceRegistry })
);
moduleLoader.initialize();
moduleLoader.install();

module.exports = moduleLoader.exports;
