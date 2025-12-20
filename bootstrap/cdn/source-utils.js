const SourceUtilsService = require("../services/cdn/source-utils-service.js");
const SourceUtilsConfig = require("../configs/source-utils.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const sourceUtilsService = new SourceUtilsService(
  new SourceUtilsConfig({ serviceRegistry, namespace })
);
sourceUtilsService.initialize();
sourceUtilsService.install();

module.exports = sourceUtilsService.exports;
