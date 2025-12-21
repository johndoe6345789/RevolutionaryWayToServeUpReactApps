/**
 * Bootstraps the CDN logging service and exposes it through the helpers namespace.
 */
const BaseEntryPoint = require("../entrypoints/base-entrypoint.js");
const LoggingService = require("../services/cdn/logging-service.js");
const LoggingServiceConfig = require("../configs/logging-service.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: LoggingService,
  ConfigClass: LoggingServiceConfig,
  configFactory: ({ serviceRegistry }) => ({ serviceRegistry }),
});
const loggingService = entrypoint.run();

loggingService.helpers.logging = loggingService;
if (loggingService.isCommonJs) {
  module.exports = loggingService;
}
