const hasWindow = typeof window !== "undefined";
const LoggingManagerConfig = require("../../configs/logging-manager.js");

/**
 * Wraps telemetry wiring for window-level error/unhandled rejection logging.
 */
class LoggingManager {
  constructor(config = new LoggingManagerConfig()) { this.config = config; this.initialized = false; }

  initialize() {
    if (this.initialized) {
      throw new Error("LoggingManager already initialized");
    }
    this.initialized = true;
    const { logClient, serializeForLog } = this.config;
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
    this.serviceRegistry = this.config.serviceRegistry;
    if (!this.serviceRegistry) {
      throw new Error("ServiceRegistry required for LoggingManager");
    }
    this.serviceRegistry.register("loggingManager", this, {
      folder: "services/core",
      domain: "core",
    });
  }

  install(windowObj) {
    if (!hasWindow || !windowObj) {
      return;
    }
    windowObj.__rwtraLog = this.logClient;
    windowObj.addEventListener("error", this._handleWindowError.bind(this));
    windowObj.addEventListener("unhandledrejection", this._handleUnhandledRejection.bind(this));
  }

  _handleWindowError(event) {
    this.logClient("window:error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }

  _handleUnhandledRejection(event) {
    const reason = event && event.reason ? event.reason : "unknown";
    this.logClient("window:unhandledrejection", {
      reason: this.serializeForLog(reason),
    });
  }
}

module.exports = LoggingManager;
