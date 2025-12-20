const LocalPathsService = require("../services/local/local-paths-service.js");
const LocalPathsConfig = require("../configs/local-paths.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const localPathsService = new LocalPathsService(
  new LocalPathsConfig({ serviceRegistry })
);
localPathsService.initialize();
localPathsService.install();

module.exports = localPathsService.exports;
