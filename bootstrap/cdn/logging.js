/**
 * Bootstraps the CDN logging service and exposes it through the helpers namespace.
 */
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");
const LoggingService = require("../services/cdn/logging-service.js");
const LoggingServiceConfig = require("../configs/cdn/logging-service.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: LoggingService,
  ConfigClass: LoggingServiceConfig,
  configFactory: ({ serviceRegistry, namespace }) => ({ serviceRegistry, namespace }),
});
const loggingService = entrypoint.run();

loggingService.helpers.logging = loggingService;
/* istanbul ignore next */
if (loggingService.isCommonJs) {
  module.exports = loggingService;
}
