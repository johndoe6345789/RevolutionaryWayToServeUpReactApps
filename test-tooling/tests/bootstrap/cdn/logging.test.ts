const LoggingService = require("../../../../bootstrap/services/cdn/logging-service.js");

describe("bootstrap/services/cdn/logging-service.js", () => {
  let service: any;
  let registry: any;
  let originalWindow: any;
  let originalNavigator: any;
  let originalFetch: any;
  let originalBlob: any;
  let consoleInfoMock: jest.Mock;
  let consoleErrorMock: jest.Mock;
  let consoleWarnMock: jest.Mock;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalNavigator = globalThis.navigator;
    originalFetch = globalThis.fetch;
    originalBlob = globalThis.Blob;

    globalThis.window = {
      location: { search: "", hostname: "example.com", href: "https://example.com" },
    };
    globalThis.navigator = { sendBeacon: jest.fn() };
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })
    );
    globalThis.Blob = class DummyBlob {
      parts: any;
      opts: any;
      constructor(parts: any, opts: any) {
        this.parts = parts;
        this.opts = opts;
      }
    };

    registry = { register: jest.fn() };
    service = new LoggingService({
      namespace: { helpers: {} },
      serviceRegistry: registry,
      ciLogQueryParam: "ci",
      clientLogEndpoint: "/__client-log",
    });
    service.initialize();
    consoleInfoMock = jest.spyOn(console, "info").mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnMock = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.navigator = originalNavigator;
    globalThis.fetch = originalFetch;
    globalThis.Blob = originalBlob;
    consoleInfoMock.mockRestore();
    consoleErrorMock.mockRestore();
    consoleWarnMock.mockRestore();
  });

  it("exposes the logging helpers through set/is helpers", () => {
    service.setCiLoggingEnabled(true);
    expect(service.isCiLoggingEnabled()).toBe(true);
    service.setCiLoggingEnabled(false);
    expect(service.isCiLoggingEnabled()).toBe(false);
  });

  it("detects CI logging from overrides and query params", () => {
    expect(service.detectCiLogging({}, { search: "?ci=true" })).toBe(true);
    globalThis.window.__RWTRA_CI_MODE__ = true;
    expect(service.detectCiLogging({}, null)).toBe(true);
    expect(service.detectCiLogging({ ciLogging: true })).toBe(true);
  });

  it("serializes errors and unstringifiable values", () => {
    const error = new Error("boom");
    const serializedError = service.serializeForLog(error);
    expect(serializedError).toMatchObject({ message: "boom" });

    const circular: any = {};
    circular.self = circular;
    const serializedCircular = service.serializeForLog(circular);
    expect(serializedCircular.type).toBe("object");
    expect(serializedCircular.note).toMatch(/unserializable/);
    expect(service.serializeForLog("value")).toBe("value");
  });

  it("waits for a promise when asked to delay", async () => {
    await expect(service.wait(0)).resolves.toBeUndefined();
  });

  it("uses navigator.sendBeacon when CI logging is enabled", () => {
    service.setCiLoggingEnabled(true);
    service.logClient("event", { detail: "data" });
    expect(globalThis.navigator!.sendBeacon).toHaveBeenCalledWith(
      "/__client-log",
      expect.any(globalThis.Blob)
    );
  });

  it("falls back to fetch for error events when CI logging is disabled", () => {
    globalThis.navigator = { sendBeacon: undefined } as any;
    service.setCiLoggingEnabled(false);
    service.logClient("event", { detail: "failure" }, "error");
    expect(globalThis.fetch).toHaveBeenCalledWith("/__client-log", expect.objectContaining({ method: "POST" }));
  });
});
