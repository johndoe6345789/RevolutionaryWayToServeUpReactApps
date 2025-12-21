const BaseService = require("../base-service.js");
const hasWindow = typeof window !== "undefined";
const LoggingManagerConfig = require("../../configs/logging-manager.js");

/**
 * Wraps telemetry wiring for window-level error/unhandled rejection logging.
 */
class LoggingManager extends BaseService {
  constructor(config = new LoggingManagerConfig()) {
    super(config);
  }

  /**
   * Sets up the Logging Manager instance before it handles requests.
   */
  initialize() {
    this._ensureNotInitialized();
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
    this._markInitialized();
    return this;
  }

  /**
   * Registers Logging Manager with the runtime service registry.
   */
  install(windowObj) {
    if (!hasWindow || !windowObj) {
      return this;
    }
    this._ensureInitialized();
    windowObj.__rwtraLog = this.logClient;
    windowObj.addEventListener("error", this._handleWindowError.bind(this));
    windowObj.addEventListener("unhandledrejection", this._handleUnhandledRejection.bind(this));
    return this;
  }

  /**
   * Performs the internal handle window error step for Logging Manager.
   */
  _handleWindowError(event) {
    this.logClient("window:error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }

  /**
   * Performs the internal handle unhandled rejection step for Logging Manager.
   */
  _handleUnhandledRejection(event) {
    const reason = event && event.reason ? event.reason : "unknown";
    this.logClient("window:unhandledrejection", {
      reason: this.serializeForLog(reason),
    });
  }
}

module.exports = LoggingManager;
