import BaseController = require("../interfaces/base-controller.js");
import BootstrapperConfig = require("../configs/core/bootstrapper.js");

export = Bootstrapper;

declare type LoggingBindings = {
  setCiLoggingEnabled(enabled: boolean): void;
  detectCiLogging(config?: Record<string, unknown>, locationOverride?: Location): boolean;
  logClient(event: string, detail?: unknown, level?: string): void;
  serializeForLog(value: unknown): unknown;
  isCiLoggingEnabled(): boolean;
};

declare type BootstrapperConfigLike = {
  configUrl?: string;
  fetch?: typeof fetch;
  logging?: LoggingBindings;
  network?: Record<string, unknown>;
  moduleLoader?: Record<string, unknown>;
};

declare class Bootstrapper extends BaseController {
  constructor(config?: BootstrapperConfig | BootstrapperConfigLike);
  /**
   * Runs the bootstrap workflow, including config loading and module rendering.
   */
  bootstrap(): Promise<void>;
  /**
   * Loads `config.json` and caches the result for future callers.
   */
  loadConfig(): Promise<Record<string, unknown>>;
}
