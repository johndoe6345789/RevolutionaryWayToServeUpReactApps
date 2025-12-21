import DynamicModulesService = require("../dynamic-modules-service.js");

export = DynamicModuleFetcher;

declare class DynamicModuleFetcher {
  constructor(config?: DynamicModuleFetcherConfig);
  fetchNamespace(
    rule: Record<string, unknown>,
    icon: string,
    registry: Record<string, unknown>,
    urls: string[]
  ): Promise<Record<string, unknown>>;
}

declare class DynamicModuleFetcherConfig {
  constructor(options?: { service?: DynamicModulesService });
  service?: DynamicModulesService;
}
