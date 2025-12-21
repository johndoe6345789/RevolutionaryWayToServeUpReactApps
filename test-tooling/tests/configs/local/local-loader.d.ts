import ServiceRegistry = require("../services/service-registry.js");

export = LocalLoaderConfig;

declare class LocalLoaderConfig {
  constructor(options?: {
    dependencies?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
    document?: Document;
  });
  dependencies?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
  document?: Document;
}
