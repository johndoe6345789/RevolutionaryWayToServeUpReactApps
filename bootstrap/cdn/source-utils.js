/**
 * Hooks the CDN source utilities service into the bootstrap namespace so it can be shared globally.
 */
const SourceUtilsService = require("../services/cdn/source-utils-service.js");
const SourceUtilsConfig = require("../configs/source-utils.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.getNamespace();
const sourceUtilsService = new SourceUtilsService(
  new SourceUtilsConfig({ serviceRegistry, namespace })
);
sourceUtilsService.initialize();
sourceUtilsService.install();

module.exports = sourceUtilsService.exports;
