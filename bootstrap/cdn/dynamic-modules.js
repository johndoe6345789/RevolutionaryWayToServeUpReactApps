/**
 * Entry point that registers the CDN dynamic modules helper into the bootstrap namespace.
 */
/**
 * Bootstraps the CDN dynamic module loader so other helpers can source icons.
 */
const DynamicModulesService = require("../services/cdn/dynamic-modules-service.js");
const DynamicModulesConfig = require("../configs/cdn/dynamic-modules.js");
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: DynamicModulesService,
  ConfigClass: DynamicModulesConfig,
  configFactory: ({ namespace }) => ({ namespace }),
});
const dynamicModulesService = entrypoint.run();

module.exports = dynamicModulesService.exports;
