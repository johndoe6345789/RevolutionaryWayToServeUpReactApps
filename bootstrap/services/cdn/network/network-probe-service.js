const BaseService = require("../../base-service.js");
const NetworkProbeServiceConfig = require("../../../configs/network-probe-service.js");

class NetworkProbeService extends BaseService {
  constructor(config = new NetworkProbeServiceConfig()) {
    super(config);
  }

  initialize() {
    this._ensureNotInitialized();
    this._applyConfig();
    this._markInitialized();
    return this;
  }

  _applyConfig() {
    const config = this.config;
    this.globalObject = config.globalObject;
    this.logClient = config.logClient;
    this.wait = config.wait;
  }

  loadScript(url) {
    const document = this.globalObject.document;
    if (!document) {
      return Promise.reject(new Error("Document unavailable for loadScript"));
    }
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url;
      el.onload = () => {
        this.logClient("loadScript:success", { url });
        resolve();
      };
      el.onerror = () => {
        this.logClient("loadScript:error", { url });
        reject(new Error("Failed to load " + url));
      };
      document.head.appendChild(el);
    });
  }

  shouldRetryStatus(status) {
    return status === 0 || status >= 500 || status === 429;
  }

  async probeUrl(url, opts = {}) {
    let { retries = 2, backoffMs = 300, allowGetFallback = true } = opts;
    let attempt = 0;

    while (true) {
      let lastStatus = 0;
      try {
        const fetchImpl = this.globalObject.fetch;
        if (!fetchImpl) {
          throw new Error("Fetch unavailable");
        }
        const res = await fetchImpl(url, {
          method: "HEAD",
          cache: "no-store",
        });
        lastStatus = res.status;
        if (res.ok) return true;

        if (allowGetFallback && (res.status === 405 || res.status === 403)) {
          const getRes = await fetchImpl(url, { method: "GET", cache: "no-store" });
          lastStatus = getRes.status;
          if (getRes.ok) return true;
        }

        if (retries > 0 && this.shouldRetryStatus(lastStatus)) {
          retries -= 1;
          await this.wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }

        this.logClient("probe:fail", { url, status: lastStatus });
        return false;
      } catch (err) {
        if (retries > 0) {
          retries -= 1;
          await this.wait(backoffMs * Math.pow(1.5, attempt++));
          continue;
        }
        this.logClient("probe:fail", { url, error: err && err.message });
        return false;
      }
    }
  }
}

module.exports = NetworkProbeService;
