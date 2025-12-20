const LocalModuleLoaderService = require("../services/local/local-module-loader-service.js");
const LocalModuleLoaderConfig = require("../configs/local-module-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const localModuleLoaderService = new LocalModuleLoaderService(
  new LocalModuleLoaderConfig({ serviceRegistry })
);
localModuleLoaderService.initialize();
localModuleLoaderService.install();

module.exports = localModuleLoaderService.exports;
