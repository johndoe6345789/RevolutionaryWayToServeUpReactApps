import HelperRegistry = require("./helper-registry.js");

export = BaseHelper;

declare class BaseHelper {
  constructor(config?: { helperRegistry?: HelperRegistry });
  protected config: { helperRegistry?: HelperRegistry };
  protected initialized: boolean;
  protected _resolveHelperRegistry(): HelperRegistry;
  protected _registerHelper(name: string, helperOrInstance: unknown, metadata?: Record<string, unknown>): void;
  initialize(): this;
}
