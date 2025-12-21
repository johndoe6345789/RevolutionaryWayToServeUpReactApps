import ServiceRegistry = require("../services/service-registry.js");

export = LoggingManagerConfig;

declare class LoggingManagerConfig {
  constructor(options?: {
    logClient?: (...args: unknown[]) => void;
    serializeForLog?: (value: unknown) => unknown;
    serviceRegistry?: ServiceRegistry;
  });
  logClient?: (...args: unknown[]) => void;
  serializeForLog?: (value: unknown) => unknown;
  serviceRegistry?: ServiceRegistry;
}
