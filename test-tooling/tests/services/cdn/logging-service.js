const LoggingService = require("../../../../bootstrap/services/cdn/logging-service.js");
const LoggingServiceConfig = require("../../../../bootstrap/configs/cdn/logging-service.js");

describe("bootstrap/services/cdn/logging-service.js", () => {
  const buildService = (overrides = {}) => {
    const serviceRegistry = {
      register: jest.fn(),
    };
    const config = new LoggingServiceConfig({
      ...overrides,
      serviceRegistry,
    });
    return { service: new LoggingService(config).initialize(), serviceRegistry };
  };

  describe("initialize", () => {
    test("registers the logging service and wires defaults", () => {
      const { service, serviceRegistry } = buildService();
      expect(service.initialized).toBe(true);
      expect(service.helpers).toBeDefined();
      expect(serviceRegistry.register).toHaveBeenCalledWith(
        "logging",
        service,
        { folder: "services/cdn", domain: "cdn" }
      );
      expect(service.ciLogQueryParam).toBeDefined();
      expect(service.clientLogEndpoint).toBeDefined();
    });
  });

  describe("setCiLoggingEnabled/isCiLoggingEnabled", () => {
    test("toggles the CI logging flag", () => {
      const { service } = buildService();
      expect(service.isCiLoggingEnabled()).toBe(false);
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
    });
  });

  describe("detectCiLogging", () => {
    const originalWindow = global.window;

    afterEach(() => {
      global.window = originalWindow;
    });

    test("honors the global CI mode flag", () => {
      global.window = { __RWTRA_CI_MODE__: true };
      const { service } = buildService();
      expect(service.detectCiLogging({})).toBe(true);
    });

    test("enables logging via query params", () => {
      global.window = { location: { search: "?ci=1" } };
      const { service } = buildService({ ciLogQueryParam: "ci" });
      expect(service.detectCiLogging({}, global.window.location)).toBe(true);
    });

    test("enables logging for localhost hosts", () => {
      const location = { hostname: "localhost", search: "" };
      const { service } = buildService();
      expect(service.detectCiLogging({}, location)).toBe(true);
    });

    test("enables logging when config forces it", () => {
      const { service } = buildService();
      expect(service.detectCiLogging({ ciLogging: true })).toBe(true);
    });

    test("defaults to false when no signals are present", () => {
      const { service } = buildService();
      expect(service.detectCiLogging({})).toBe(false);
    });
  });

  describe("serializeForLog", () => {
    test("serializes errors into message/stack objects", () => {
      const { service } = buildService();
      const err = new Error("boom");
      expect(service.serializeForLog(err)).toMatchObject({ message: "boom" });
    });

    test("serializes objects into JSON-friendly copies", () => {
      const { service } = buildService();
      const input = { nested: { value: 1 } };
      expect(service.serializeForLog(input)).toEqual(input);
    });

    test("handles unserializable objects", () => {
      const { service } = buildService();
      const input = {};
      input.self = input;
      expect(service.serializeForLog(input)).toEqual({
        type: "object",
        note: "unserializable",
      });
    });

    test("returns primitives unchanged", () => {
      const { service } = buildService();
      expect(service.serializeForLog("hello")).toBe("hello");
    });
  });

  describe("wait", () => {
    test("resolves after the specified delay", async () => {
      const { service } = buildService();
      await expect(service.wait(0)).resolves.toBeUndefined();
    });
  });

  describe("logClient", () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;
    const originalFetch = global.fetch;
    const originalConsole = global.console;

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
      global.fetch = originalFetch;
      global.console = originalConsole;
    });

    test("skips info logs when CI logging is disabled", () => {
      global.window = { location: { href: "https://example.com" } };
      global.navigator = { sendBeacon: jest.fn() };
      const { service } = buildService();
      service.setCiLoggingEnabled(false);

      service.logClient("event", { a: 1 }, "info");

      expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
    });

    test("sends beacon logs for warn/error levels", () => {
      global.window = { location: { href: "https://example.com" } };
      global.navigator = { sendBeacon: jest.fn() };
      global.console = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
      const { service } = buildService();
      service.setCiLoggingEnabled(false);

      service.logClient("warn-event", { a: 1 }, "warn");

      expect(global.navigator.sendBeacon).toHaveBeenCalled();
      expect(global.console.warn).toHaveBeenCalledWith(
        "[bootstrap]",
        "warn-event",
        { a: 1 }
      );
    });

    test("falls back to fetch when sendBeacon is unavailable", () => {
      global.window = { location: { href: "https://example.com" } };
      global.navigator = {};
      global.fetch = jest.fn(() => Promise.resolve());
      const { service } = buildService();
      service.setCiLoggingEnabled(true);

      service.logClient("event", { a: 1 }, "info");

      expect(global.fetch).toHaveBeenCalledWith(service.clientLogEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: expect.any(String),
      });
    });
  });
});
