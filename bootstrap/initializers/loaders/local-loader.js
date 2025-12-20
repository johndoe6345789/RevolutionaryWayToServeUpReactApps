/**
 * Sets up the shared local loader surface, wiring document overrides and helper dependencies.
 */
const LocalLoaderService = require("../services/local/local-loader-service.js");
const LocalLoaderConfig = require("../configs/local-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.getNamespace();
const document = rootHandler.getDocument();
const localLoaderService = new LocalLoaderService(
  new LocalLoaderConfig({
    serviceRegistry,
    namespace,
    document,
  })
);
localLoaderService.initialize();
localLoaderService.install();

module.exports = localLoaderService.exports;
