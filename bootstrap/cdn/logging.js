(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const LoggingService = require("../services/cdn/logging-service.js");
  const LoggingServiceConfig = require("../configs/logging-service.js");
  const serviceRegistry = require("../services/service-registry-instance.js");

  const loggingService = new LoggingService(
    new LoggingServiceConfig({ serviceRegistry })
  );
  loggingService.initialize();

  helpers.logging = loggingService;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = loggingService;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
