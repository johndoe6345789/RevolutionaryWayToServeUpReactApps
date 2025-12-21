/**
 * Hooks the CDN source utilities service into the bootstrap namespace so it can be shared globally.
 */
const SourceUtilsService = require("../services/cdn/source-utils-service.js");
const SourceUtilsConfig = require("../configs/cdn/source-utils.js");
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: SourceUtilsService,
  ConfigClass: SourceUtilsConfig,
  configFactory: ({ namespace }) => ({ namespace }),
});
const sourceUtilsService = entrypoint.run();

module.exports = sourceUtilsService.exports;
