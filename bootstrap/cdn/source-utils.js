const SourceUtilsService = require("../services/cdn/source-utils-service.js");
const SourceUtilsConfig = require("../configs/source-utils.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const sourceUtilsService = new SourceUtilsService(
  new SourceUtilsConfig({ serviceRegistry })
);
sourceUtilsService.initialize();
sourceUtilsService.install();

module.exports = sourceUtilsService.exports;
