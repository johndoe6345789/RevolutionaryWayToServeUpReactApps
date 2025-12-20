const LocalModuleLoaderService = require("../services/local/local-module-loader-service.js");

const localModuleLoaderService = new LocalModuleLoaderService();
localModuleLoaderService.initialize();
localModuleLoaderService.install();

module.exports = localModuleLoaderService.exports;
