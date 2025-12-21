import GlobalRootHandler = require("./constants/global-root-handler.js");

export = BaseBootstrapApp;

declare class BaseBootstrapApp {
  constructor(options?: { rootHandler?: GlobalRootHandler });
  rootHandler: GlobalRootHandler;
  bootstrapNamespace: Record<string, unknown>;
  helpersNamespace: Record<string, unknown>;
  isCommonJs: boolean;
  globalRoot: unknown;
  static isBrowser(windowObj?: Window | typeof globalThis): boolean;
  _resolveHelper(name: string, path: string): unknown;
}
