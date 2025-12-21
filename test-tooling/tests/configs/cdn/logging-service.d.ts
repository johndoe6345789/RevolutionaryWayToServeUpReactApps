import ServiceRegistry = require("../services/service-registry.js");

export = LoggingServiceConfig;

declare class LoggingServiceConfig {
  constructor(options?: {
    ciLogQueryParam?: string;
    clientLogEndpoint?: string;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
  });
  ciLogQueryParam?: string;
  clientLogEndpoint?: string;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
}
