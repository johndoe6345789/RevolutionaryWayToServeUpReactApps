/**
 * Bootstraps the CDN tools helpers and exposes them through the namespace.
 */
const ToolsLoaderService = require("../services/cdn/tools-service.js");
const ToolsLoaderConfig = require("../configs/cdn/tools.js");
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: ToolsLoaderService,
  ConfigClass: ToolsLoaderConfig,
  configFactory: ({ namespace }) => ({ namespace }),
});
const toolsLoaderService = entrypoint.run();

module.exports = toolsLoaderService.exports;
