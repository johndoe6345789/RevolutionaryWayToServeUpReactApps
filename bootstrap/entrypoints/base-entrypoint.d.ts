import ServiceRegistry = require("../registries/service-registry.js");

export = BaseEntryPoint;

declare interface ServiceLike {
  initialize(): ServiceLike;
  install?(): ServiceLike;
}

declare class BaseEntryPoint {
  constructor(options: BaseEntryPointOptions);
  run(): ServiceLike;
}

declare interface BaseEntryPointOptions {
  ServiceClass: new (config?: Record<string, unknown>) => ServiceLike;
  ConfigClass: new (config?: Record<string, unknown>) => Record<string, unknown>;
  configFactory?: (context: {
    serviceRegistry: ServiceRegistry;
    root: any;
    namespace: Record<string, unknown>;
    document: Document | undefined;
  }) => Record<string, unknown>;
}
