(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const CI_LOG_QUERY_PARAM = "ci";
  const CLIENT_LOG_ENDPOINT = "/__client-log";
  let ciLoggingEnabled = false;

  function setCiLoggingEnabled(enabled) {
    ciLoggingEnabled = !!enabled;
  }

  function detectCiLogging(config) {
    if (typeof window !== "undefined") {
      if (typeof window.__RWTRA_CI_MODE__ === "boolean") {
        return window.__RWTRA_CI_MODE__;
      }
      const params = new URLSearchParams(window.location.search || "");
      const q = params.get(CI_LOG_QUERY_PARAM);
      if (q && (q === "1" || q.toLowerCase() === "true")) {
        return true;
      }
    }
    if (config && config.ciLogging === true) return true;
    return false;
  }

  function serializeForLog(value) {
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

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function logClient(event, detail, level = "info") {
    const isErrorLevel = level === "error" || level === "warn";
    if (!ciLoggingEnabled && !isErrorLevel) return;
    if (typeof window === "undefined") return;
    try {
      const payload = {
        event,
        detail: serializeForLog(detail),
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

  function isCiLoggingEnabled() {
    return ciLoggingEnabled;
  }

  const exports = {
    setCiLoggingEnabled,
    detectCiLogging,
    logClient,
    wait,
    serializeForLog
    ,
    isCiLoggingEnabled
  };

  helpers.logging = exports;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
