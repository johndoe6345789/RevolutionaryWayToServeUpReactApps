import ServiceRegistry = require("../services/service-registry.js");

export = TsxCompilerConfig;

declare class TsxCompilerConfig {
  constructor(options?: {
    logging?: Record<string, unknown>;
    sourceUtils?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
    fetch?: typeof fetch;
    Babel?: unknown;
  });
  logging?: Record<string, unknown>;
  sourceUtils?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
  fetch?: typeof fetch;
  Babel?: unknown;
}
