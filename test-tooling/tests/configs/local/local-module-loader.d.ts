import ServiceRegistry = require("../services/service-registry.js");

export = LocalModuleLoaderConfig;

declare class LocalModuleLoaderConfig {
  constructor(options?: {
    dependencies?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
    fetch?: typeof fetch;
  });
  dependencies?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
  fetch?: typeof fetch;
}
