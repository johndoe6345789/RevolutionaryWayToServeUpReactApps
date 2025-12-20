const LocalPathsService = require("../services/local/local-paths-service.js");
const LocalPathsConfig = require("../configs/local-paths.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.namespace;
const localPathsService = new LocalPathsService(
  new LocalPathsConfig({
    serviceRegistry,
    namespace,
  })
);
localPathsService.initialize();
localPathsService.install();

module.exports = localPathsService.exports;
