const BaseService = require("../base-service.js");
const LoggingServiceConfig = require("../../configs/cdn/logging-service.js");
const { getStringService } = require('../../../string/string-service');

/**
 * Centralizes CI logging defaults, serialization helpers, and UI error forwarding.
 */
class LoggingService extends BaseService {
  /**
   * Returns the shared logging defaults defined in `constants/common.js`.
   */
  static get defaults() {
    return require("../../constants/common.js");
  }

  constructor(config = new LoggingServiceConfig()) { super(config); }

  /**
   * Sets up bindings, configuration fallbacks, and registers the logging service.
   */
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    const namespace = this.config.namespace || {};
    this.namespace = namespace;
    this.helpers = namespace.helpers || (namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
    this.ciLoggingEnabled = false;
    this.setCiLoggingEnabled = this.setCiLoggingEnabled.bind(this);
    this.detectCiLogging = this.detectCiLogging.bind(this);
    this.logClient = this.logClient.bind(this);
    this.wait = this.wait.bind(this);
    this.serializeForLog = this.serializeForLog.bind(this);
    this.isCiLoggingEnabled = this.isCiLoggingEnabled.bind(this);
    const { ciLogQueryParam, clientLogEndpoint } = this.config;
    const defaults = this.constructor.defaults;
    this.ciLogQueryParam = ciLogQueryParam ?? defaults.ciLogQueryParam;
    this.clientLogEndpoint = clientLogEndpoint ?? defaults.clientLogEndpoint;
    this.serviceRegistry = this._requireServiceRegistry();
    this.serviceRegistry.register("logging", this, {
      folder: "services/cdn",
      domain: "cdn",
    }, []);
    return this;
  }

  /**
   * Toggles the flag that controls whether CI logging traffic is emitted.
   */
  setCiLoggingEnabled(enabled) {
    this.ciLoggingEnabled = !!enabled;
  }

  /**
   * Determines whether CI logging should be enabled by checking globals, query params, and overrides.
   */
  detectCiLogging(config, locationOverride) {
    if (typeof window !== "undefined") {
      if (typeof window.__RWTRA_CI_MODE__ === "boolean") {
        return window.__RWTRA_CI_MODE__;
      }
    }

    const locationObject =
      locationOverride ||
      (typeof window !== "undefined" ? window.location : undefined);
    if (locationObject) {
      const params = new URLSearchParams(locationObject.search || "");
      const q = params.get(this.ciLogQueryParam);
      if (q && (q === "1" || q.toLowerCase() === "true")) {
        return true;
      }
      const host = locationObject.hostname;
      if (host === "127.0.0.1" || host === "localhost") {
        return true;
      }
    }
    if (config && config.ciLogging === true) return true;
    return false;
  }

  /**
   * Converts the provided value into a JSON-friendly structure for client logs.
   */
  serializeForLog(value) {
    if (value instanceof Error) {
      return { message: value.message, stack: value.stack };
    }
    if (typeof value === "object") {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (_err) {
        return { type: typeof value, note: "unserializable" };
      }
    }
    return value;
  }

  /**
   * Returns a Promise that resolves after the specified number of milliseconds.
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sends the event payload to the configured logging endpoint (or console) if logging is enabled.
   */
  logClient(event, detail, level = "info") {
    const isErrorLevel = level === "error" || level === "warn";
    if (!this.ciLoggingEnabled && !isErrorLevel) return;
    if (typeof window === "undefined") return;
    try {
      const payload = {
        event,
        detail: this.serializeForLog(detail),
        ts: new Date().toISOString(),
        href: window.location && window.location.href
      };
      const body = JSON.stringify(payload);
      const sendBeacon =
        typeof navigator !== "undefined" &&
        navigator &&
        typeof navigator.sendBeacon === "function";
      if (sendBeacon) {
        navigator.sendBeacon(
          this.clientLogEndpoint,
          new Blob([body], { type: "application/json" })
        );
      } else if (typeof fetch === "function") {
        fetch(this.clientLogEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body
        }).catch(() => {});
      }
      if (typeof console !== "undefined" && console.info) {
        const logFn =
          level === "error"
            ? console.error
            : level === "warn"
              ? console.warn
              : console.info;
        const strings = getStringService();
        logFn(strings.getConsole('bootstrap_1'), event, detail);
      }
    } catch (_err) {
      // ignore logging failures to avoid interfering with app execution
    }
  }

  /**
   * Indicates whether CI logging has been toggled on.
   */
  isCiLoggingEnabled() {
    return this.ciLoggingEnabled;
  }
}

module.exports = LoggingService;
