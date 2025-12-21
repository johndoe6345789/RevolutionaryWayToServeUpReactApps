/**
 * Bootstraps the local path utilities so helpers can normalize module paths.
 */
const LocalPathsService = require("../../services/local/local-paths-service.js");
const LocalPathsConfig = require("../../configs/local/local-paths.js");
const BaseEntryPoint = require("../../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: LocalPathsService,
  ConfigClass: LocalPathsConfig,
  configFactory: ({ namespace }) => ({ namespace }),
});
const localPathsService = entrypoint.run();

module.exports = localPathsService.exports;
