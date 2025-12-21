import ServiceRegistry = require("../services/service-registry.js");

export = DynamicModulesConfig;

declare class DynamicModulesConfig {
  constructor(options?: {
    dependencies?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
  });
  dependencies?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
}
