const LocalLoaderService = require("../services/local/local-loader-service.js");
const LocalLoaderConfig = require("../configs/local-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const localLoaderService = new LocalLoaderService(
  new LocalLoaderConfig({ serviceRegistry })
);
localLoaderService.initialize();
localLoaderService.install();

module.exports = localLoaderService.exports;
