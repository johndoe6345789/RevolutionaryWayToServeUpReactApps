import ServiceRegistry = require("../services/service-registry.js");
import { IConfig } from "../../interfaces/IConfig";

export = DynamicModulesConfig;

declare class DynamicModulesConfig implements IConfig {
  constructor(options?: {
    dependencies?: Record<string, unknown>;
    serviceRegistry?: ServiceRegistry;
    namespace?: Record<string, unknown>;
  });
  dependencies?: Record<string, unknown>;
  serviceRegistry?: ServiceRegistry;
  namespace?: Record<string, unknown>;
  
  validate(): void;
  merge(additional: Record<string, unknown>): IConfig;
  toObject(): Record<string, unknown>;
}
