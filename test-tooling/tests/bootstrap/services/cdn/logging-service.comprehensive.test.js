// Comprehensive test suite for LoggingService class
const LoggingService = require("../../../../../bootstrap/services/cdn/logging-service.js");

// Simple mock function implementation for Bun
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = undefined;
  mockFn.mockReturnValue = (value) => {
    mockFn.returnValue = value;
    return mockFn;
  };
  return mockFn;
}

describe("LoggingService", () => {
  let originalConsole;
  let originalWindow;
  let originalNavigator;
  let originalFetch;

  beforeEach(() => {
    originalConsole = global.console;
    originalWindow = global.window;
    originalNavigator = global.navigator;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.console = originalConsole;
    global.window = originalWindow;
    global.navigator = originalNavigator;
    global.fetch = originalFetch;
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      const mockConfig = { test: "value" };
      const service = new LoggingService(mockConfig);
      
      expect(service).toBeInstanceOf(LoggingService);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new LoggingService();
      expect(serviceWithDefault).toBeInstanceOf(LoggingService);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize all properties", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        ciLogQueryParam: "ci",
        clientLogEndpoint: "/__client-log", // Default endpoint
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();

      expect(service.namespace).toBe(mockConfig.namespace);
      expect(service.helpers).toBe(mockConfig.namespace.helpers);
      expect(service.ciLoggingEnabled).toBe(false);
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
      expect(service.ciLogQueryParam).toBe("ci");
      expect(service.clientLogEndpoint).toBe("/__client-log");
    });

    test("should register the service in the service registry", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        ciLogQueryParam: "ci",
        clientLogEndpoint: "/__client-log",
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();

      expect(mockServiceRegistry.register.calls.length).toBe(1);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("logging");
      expect(mockServiceRegistry.register.calls[0][1]).toBe(service);
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/cdn",
        domain: "cdn"
      });
    });

    test("should throw if initialized twice", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    test("should enable CI logging when true is passed", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should disable CI logging when false is passed", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true); // First enable
      service.setCiLoggingEnabled(false); // Then disable
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });

    test("should coerce truthy values to true", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled("truthy");
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should coerce falsy values to false", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(0);
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("isCiLoggingEnabled method", () => {
    test("should return the current CI logging state", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      
      expect(service.isCiLoggingEnabled()).toBe(false);
      
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
    });
  });

  describe("detectCiLogging method", () => {
    test("should return true when window.__RWTRA_CI_MODE__ is true", () => {
      global.window = { 
        __RWTRA_CI_MODE__: true,
        location: { search: "" }
      };

      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(true);
    });

    test("should return false when window.__RWTRA_CI_MODE__ is false", () => {
      global.window = { 
        __RWTRA_CI_MODE__: false,
        location: { search: "" }
      };

      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(false);
    });

    test("should return true when ci query param is 1", () => {
      const locationOverride = { search: "?ci=1" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when ci query param is 'true'", () => {
      const locationOverride = { search: "?ci=true" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when ci query param is 'TRUE' (case insensitive)", () => {
      const locationOverride = { search: "?ci=TRUE" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return false when ci query param is invalid", () => {
      const locationOverride = { search: "?ci=invalid" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(false);
    });

    test("should return true when hostname is localhost", () => {
      const locationOverride = { search: "", hostname: "localhost" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when hostname is 127.0.0.1", () => {
      const locationOverride = { search: "", hostname: "127.0.0.1" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when config.ciLogging is true", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging({ ciLogging: true });
      
      expect(result).toBe(true);
    });

    test("should return false when no conditions are met", () => {
      const locationOverride = { search: "", hostname: "example.com" };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(false);
    });
  });

  describe("serializeForLog method", () => {
    test("should serialize Error objects properly", () => {
      const error = new Error("Test error");
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.serializeForLog(error);
      
      expect(result.message).toBe("Test error");
      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe("string");
    });

    test("should serialize regular objects", () => {
      const obj = { name: "test", value: 42 };
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    test("should handle nested objects", () => {
      const obj = { 
        user: { name: "John", age: 30 },
        settings: { theme: "dark" }
      };
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    test("should handle arrays", () => {
      const arr = [1, 2, 3, "test"];
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.serializeForLog(arr);
      
      expect(result).toEqual(arr);
    });

    test("should handle unserializable objects", () => {
      const obj = { };
      obj.circular = obj; // Creates circular reference
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual({
        type: "object",
        note: "unserializable"
      });
    });

    test("should return primitive values as-is", () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      
      expect(service.serializeForLog("string")).toBe("string");
      expect(service.serializeForLog(42)).toBe(42);
      expect(service.serializeForLog(true)).toBe(true);
      expect(service.serializeForLog(null)).toBe(null);
      expect(service.serializeForLog(undefined)).toBe(undefined);
    });
  });

  describe("wait method", () => {
    test("should return a promise that resolves after specified time", async () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      
      const start = Date.now();
      await service.wait(10); // Wait for 10ms
      const end = Date.now();
      
      // The wait should take at least 10ms
      expect(end - start).toBeGreaterThanOrEqual(8); // Allow some tolerance
    });

    test("should resolve immediately when passed 0", async () => {
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      
      const start = Date.now();
      await service.wait(0);
      const end = Date.now();
      
      // Should resolve quickly
      expect(end - start).toBeLessThan(100);
    });
  });

  describe("logClient method", () => {
    test("should not log when CI logging is disabled and not an error level", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: createMockFunction() };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      // CI logging is disabled by default
      service.logClient("test-event", { data: "test" });
      
      // Should not call sendBeacon when CI logging is disabled
      expect(global.navigator.sendBeacon.calls.length).toBe(0);
    });

    test("should log error/warn events even when CI logging is disabled", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: createMockFunction() };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.logClient("error-event", { data: "test" }, "error");
      
      // Should call sendBeacon for error events even when CI logging is disabled
      expect(global.navigator.sendBeacon.calls.length).toBe(1);
    });

    test("should enable CI logging and send beacon when enabled", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: createMockFunction() };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" });
      
      expect(global.navigator.sendBeacon.calls.length).toBe(1);
    });

    test("should log to console with correct level", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: createMockFunction() };
      global.console = { info: createMockFunction(), error: createMockFunction(), warn: createMockFunction() };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" }, "error");
      
      expect(global.console.error.calls.length).toBe(1);
      expect(global.console.error.calls[0]).toEqual(["[bootstrap]", "test-event", { data: "test" }]);
    });

    test("should use different console methods based on level", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: createMockFunction() };
      global.console = { info: createMockFunction(), error: createMockFunction(), warn: createMockFunction() };
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("info-event", { data: "test" }, "info");
      expect(global.console.info.calls.length).toBe(1);
      expect(global.console.info.calls[0]).toEqual(["[bootstrap]", "info-event", { data: "test" }]);
      
      service.logClient("warn-event", { data: "test" }, "warn");
      expect(global.console.warn.calls.length).toBe(1);
      expect(global.console.warn.calls[0]).toEqual(["[bootstrap]", "warn-event", { data: "test" }]);
      
      service.logClient("error-event", { data: "test" }, "error");
      expect(global.console.error.calls.length).toBe(1);
      expect(global.console.error.calls[0]).toEqual(["[bootstrap]", "error-event", { data: "test" }]);
    });

    test("should fallback to fetch when sendBeacon is not available", async () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: undefined }; // No sendBeacon
      global.fetch = createMockFunction().mockReturnValue(Promise.resolve({ ok: true }));
      
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" });
      
      expect(global.fetch.calls.length).toBe(1);
      expect(global.fetch.calls[0][0]).toBe("/__client-log"); // Default endpoint
      expect(global.fetch.calls[0][1]).toBeDefined();
      expect(global.fetch.calls[0][1].method).toBe("POST");
      expect(global.fetch.calls[0][1].headers["content-type"]).toBe("application/json");
    });

    test("should not log when window is undefined", () => {
      // Don't set global.window
      const mockServiceRegistry = { register: createMockFunction() };
      const mockConfig = {
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      };
      
      const service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      expect(() => {
        service.logClient("test-event", { data: "test" });
      }).not.toThrow();
    });
  });

  describe("static defaults property", () => {
    test("should return the shared logging defaults", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toBeDefined();
      // We expect it to return the common constants
      expect(typeof defaults).toBe("object");
    });
  });
});