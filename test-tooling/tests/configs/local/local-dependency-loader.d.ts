import HelperRegistry = require("../helpers/helper-registry.js");

export = LocalDependencyLoaderConfig;

declare class LocalDependencyLoaderConfig {
  constructor(options?: {
    overrides?: Record<string, unknown>;
    helpers?: Record<string, unknown>;
    helperRegistry?: HelperRegistry;
    isCommonJs?: boolean;
  });
  overrides: Record<string, unknown>;
  helpers: Record<string, unknown>;
  helperRegistry?: HelperRegistry;
  isCommonJs: boolean;
}
