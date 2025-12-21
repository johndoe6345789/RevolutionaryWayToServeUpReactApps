const NetworkProbeService = require("../../../../../bootstrap/services/cdn/network/network-probe-service.js");
const NetworkProbeServiceConfig = require("../../../../../bootstrap/configs/cdn/network-probe-service.js");

describe("bootstrap/services/cdn/network/network-probe-service.js", () => {
  const buildService = ({ globalObject, logClient, wait } = {}) => {
    const config = new NetworkProbeServiceConfig({ globalObject, logClient, wait });
    return new NetworkProbeService(config).initialize();
  };

  describe("initialize", () => {
    test("applies config and marks initialized", () => {
      const globalObject = { name: "global" };
      const logClient = jest.fn();
      const wait = jest.fn();
      const service = new NetworkProbeService(
        new NetworkProbeServiceConfig({ globalObject, logClient, wait })
      );

      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.globalObject).toBe(globalObject);
      expect(service.logClient).toBe(logClient);
      expect(service.wait).toBe(wait);
      expect(service.initialized).toBe(true);
    });
  });

  describe("_applyConfig", () => {
    test("copies config values onto the service", () => {
      const globalObject = { name: "global" };
      const logClient = jest.fn();
      const wait = jest.fn();
      const service = new NetworkProbeService(
        new NetworkProbeServiceConfig({ globalObject, logClient, wait })
      );

      service._applyConfig();

      expect(service.globalObject).toBe(globalObject);
      expect(service.logClient).toBe(logClient);
      expect(service.wait).toBe(wait);
    });
  });

  describe("loadScript", () => {
    test("rejects when document is unavailable", async () => {
      const service = buildService({ globalObject: {} });
      await expect(service.loadScript("https://example.com")).rejects.toThrow(
        "Document unavailable for loadScript"
      );
    });

    test("resolves and logs success when the script loads", async () => {
      const logClient = jest.fn();
      let createdEl;
      const document = {
        createElement: jest.fn(() => (createdEl = {})),
        head: {
          appendChild: jest.fn((el) => el.onload()),
        },
      };
      const service = buildService({ globalObject: { document }, logClient });

      await expect(service.loadScript("https://example.com/app.js")).resolves.toBeUndefined();

      expect(document.createElement).toHaveBeenCalledWith("script");
      expect(createdEl.src).toBe("https://example.com/app.js");
      expect(logClient).toHaveBeenCalledWith("loadScript:success", {
        url: "https://example.com/app.js",
      });
    });

    test("rejects and logs errors when the script fails", async () => {
      const logClient = jest.fn();
      const document = {
        createElement: jest.fn(() => ({})),
        head: {
          appendChild: jest.fn((el) => el.onerror()),
        },
      };
      const service = buildService({ globalObject: { document }, logClient });

      await expect(service.loadScript("https://example.com/missing.js")).rejects.toThrow(
        "Failed to load https://example.com/missing.js"
      );

      expect(logClient).toHaveBeenCalledWith("loadScript:error", {
        url: "https://example.com/missing.js",
      });
    });
  });

  describe("shouldRetryStatus", () => {
    test("retries on status 0, 429, and 5xx", () => {
      const service = buildService({ globalObject: {} });
      expect(service.shouldRetryStatus(0)).toBe(true);
      expect(service.shouldRetryStatus(429)).toBe(true);
      expect(service.shouldRetryStatus(500)).toBe(true);
      expect(service.shouldRetryStatus(503)).toBe(true);
    });

    test("does not retry on 2xx/4xx non-429 statuses", () => {
      const service = buildService({ globalObject: {} });
      expect(service.shouldRetryStatus(200)).toBe(false);
      expect(service.shouldRetryStatus(404)).toBe(false);
    });
  });

  describe("probeUrl", () => {
    test("logs and returns false when fetch is unavailable", async () => {
      const logClient = jest.fn();
      const wait = jest.fn(() => Promise.resolve());
      const service = buildService({ globalObject: {}, logClient, wait });

      const result = await service.probeUrl("https://example.com");

      expect(result).toBe(false);
      expect(wait).toHaveBeenCalled();
      expect(logClient).toHaveBeenCalledWith("probe:fail", {
        url: "https://example.com",
        error: "Fetch unavailable",
      });
    });

    test("returns true when HEAD request succeeds", async () => {
      const fetch = jest.fn(async () => ({ ok: true, status: 200 }));
      const service = buildService({ globalObject: { fetch } });

      const result = await service.probeUrl("https://example.com");

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith("https://example.com", {
        method: "HEAD",
        cache: "no-store",
      });
    });

    test("falls back to GET when HEAD is not allowed", async () => {
      const fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 405 })
        .mockResolvedValueOnce({ ok: true, status: 200 });
      const service = buildService({ globalObject: { fetch } });

      const result = await service.probeUrl("https://example.com");

      expect(result).toBe(true);
      expect(fetch).toHaveBeenNthCalledWith(1, "https://example.com", {
        method: "HEAD",
        cache: "no-store",
      });
      expect(fetch).toHaveBeenNthCalledWith(2, "https://example.com", {
        method: "GET",
        cache: "no-store",
      });
    });

    test("retries on retryable status and logs failure", async () => {
      const fetch = jest.fn(async () => ({ ok: false, status: 500 }));
      const logClient = jest.fn();
      const wait = jest.fn(() => Promise.resolve());
      const service = buildService({ globalObject: { fetch }, logClient, wait });

      const result = await service.probeUrl("https://example.com", {
        retries: 1,
        backoffMs: 10,
        allowGetFallback: false,
      });

      expect(result).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(wait).toHaveBeenCalledTimes(1);
      expect(logClient).toHaveBeenCalledWith("probe:fail", {
        url: "https://example.com",
        status: 500,
      });
    });
  });
});
