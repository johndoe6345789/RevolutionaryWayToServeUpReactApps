import ServiceRegistry = require("../services/service-registry.js");

export = LocalPathsConfig;

declare class LocalPathsConfig {
  constructor(options?: {
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
  });
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
}
