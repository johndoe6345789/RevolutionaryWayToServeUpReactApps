import ServiceRegistry = require("../services/service-registry.js");

export = ModuleLoaderConfig;

declare class ModuleLoaderConfig {
  constructor(options?: {
    dependencies?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    environmentRoot?: unknown;
  });
  dependencies?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  environmentRoot?: unknown;
}
