import DynamicModulesService = require("../dynamic-modules-service.js");
import HelperRegistry = require("../../helpers/helper-registry.js");

export = ProviderResolver;

declare class ProviderResolver {
  constructor(config?: ProviderResolverConfig);
  resolveBases(rule: Record<string, unknown>): string[];
  buildCandidates(rule: Record<string, unknown>, icon: string, bases: string[]): string[];
}

declare class ProviderResolverConfig {
  constructor(options?: {
    service?: DynamicModulesService;
    helperRegistry?: HelperRegistry;
  });
  service?: DynamicModulesService;
  helperRegistry?: HelperRegistry;
}
