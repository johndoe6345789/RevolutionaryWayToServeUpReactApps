import DynamicModulesService = require("../dynamic-modules-service.js");

export = ProviderResolverConfig;

declare class ProviderResolverConfig {
  constructor(options?: { service?: DynamicModulesService });
  service?: DynamicModulesService;
}
