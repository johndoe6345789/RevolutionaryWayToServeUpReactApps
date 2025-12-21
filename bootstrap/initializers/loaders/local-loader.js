/**
 * Boots the local loader surface, wiring helper dependencies via BaseEntryPoint.
 */
const LocalLoaderService = require("../../services/local/local-loader-service.js");
const LocalLoaderConfig = require("../../configs/local/local-loader.js");
const BaseEntryPoint = require("../../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: LocalLoaderService,
  ConfigClass: LocalLoaderConfig,
  configFactory: ({ namespace, document }) => ({ namespace, document }),
});
const localLoaderService = entrypoint.run();

module.exports = localLoaderService.exports;
