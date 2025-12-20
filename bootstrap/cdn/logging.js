(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const CI_LOG_QUERY_PARAM = require("../constants/ci-log-query-param.js");
  const CLIENT_LOG_ENDPOINT = require("../constants/client-log-endpoint.js");

  class LoggingService {
    constructor() { this.initialized = false; }

    initialize() {
      if (this.initialized) {
        throw new Error("LoggingService already initialized");
      }
      this.initialized = true;
      this.ciLoggingEnabled = false;
      this.setCiLoggingEnabled = this.setCiLoggingEnabled.bind(this);
      this.detectCiLogging = this.detectCiLogging.bind(this);
      this.logClient = this.logClient.bind(this);
      this.wait = this.wait.bind(this);
      this.serializeForLog = this.serializeForLog.bind(this);
      this.isCiLoggingEnabled = this.isCiLoggingEnabled.bind(this);
    }

    setCiLoggingEnabled(enabled) {
      this.ciLoggingEnabled = !!enabled;
    }

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
        const q = params.get(CI_LOG_QUERY_PARAM);
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

    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

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
            CLIENT_LOG_ENDPOINT,
            new Blob([body], { type: "application/json" })
          );
        } else if (typeof fetch === "function") {
          fetch(CLIENT_LOG_ENDPOINT, {
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
          logFn("[bootstrap]", event, detail);
        }
      } catch (_err) {
        // ignore logging failures to avoid interfering with app execution
      }
    }

    isCiLoggingEnabled() {
      return this.ciLoggingEnabled;
    }
  }

  const exports = new LoggingService();
  exports.initialize();

  helpers.logging = exports;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
