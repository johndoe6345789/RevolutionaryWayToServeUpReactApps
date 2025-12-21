import BaseBootstrapApp = require("./base-bootstrap-app.js");

export = BootstrapApp;

declare class BootstrapApp extends BaseBootstrapApp {
  constructor(options?: { rootHandler?: import("./constants/global-root-handler.js") });
  initialize(): this;
  getExports(): Record<string, unknown>;
  installLogging(windowObj?: Window): void;
  runBootstrapper(windowObj?: Window & { __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean }): void;
}
