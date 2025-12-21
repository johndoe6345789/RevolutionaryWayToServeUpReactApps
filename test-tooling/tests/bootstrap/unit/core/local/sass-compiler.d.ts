import ServiceRegistry = require("../services/service-registry.js");

export = SassCompilerConfig;

declare class SassCompilerConfig {
  constructor(options?: {
    fetch?: typeof fetch;
    document?: Document;
    SassImpl?: unknown;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
  });
  fetch?: typeof fetch;
  document?: Document;
  SassImpl?: unknown;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
}
