(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const LoggingService = require("./logging-service.js");
  const LoggingServiceConfig = require("../configs/logging-service.js");

  const loggingService = new LoggingService(new LoggingServiceConfig());
  loggingService.initialize();

  helpers.logging = loggingService;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = loggingService;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
