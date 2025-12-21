// Comprehensive test suite for LoggingService class
const LoggingService = require("../../../../bootstrap/services/cdn/logging-service.js");

describe("LoggingService", () => {
  let service;
  let mockConfig;
  let mockServiceRegistry;

  beforeEach(() => {
    // Mock service registry
    mockServiceRegistry = {
      register: jest.fn()
    };

    // Mock config with necessary properties
    mockConfig = {
      namespace: { helpers: {} },
      ciLogQueryParam: "ci",
      clientLogEndpoint: "/logs",
      serviceRegistry: mockServiceRegistry
    };

    service = new LoggingService(mockConfig);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
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
      service.initialize();

      expect(service.namespace).toBe(mockConfig.namespace);
      expect(service.helpers).toBe(mockConfig.namespace.helpers);
      expect(service.ciLoggingEnabled).toBe(false);
      expect(service.isCommonJs).toBe(true); // In test environment
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
      expect(service.ciLogQueryParam).toBe("ci");
      expect(service.clientLogEndpoint).toBe("/logs");
    });

    test("should register the service in the service registry", () => {
      service.initialize();

      expect(mockServiceRegistry.register).toHaveBeenCalledWith("logging", service, {
        folder: "services/cdn",
        domain: "cdn"
      });
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow(/already initialized/);
    });

    test("should use default values when config properties are missing", () => {
      const configWithoutDefaults = { namespace: { helpers: {} } };
      const serviceWithoutDefaults = new LoggingService(configWithoutDefaults);
      
      serviceWithoutDefaults.initialize();

      // Should get defaults from the static defaults property
      expect(serviceWithoutDefaults.ciLogQueryParam).toBeDefined();
      expect(serviceWithoutDefaults.clientLogEndpoint).toBeDefined();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    test("should enable CI logging when true is passed", () => {
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should disable CI logging when false is passed", () => {
      service.initialize();
      service.setCiLoggingEnabled(true); // First enable
      service.setCiLoggingEnabled(false); // Then disable
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });

    test("should coerce truthy values to true", () => {
      service.initialize();
      service.setCiLoggingEnabled("truthy");
      
      expect(service.isCiLoggingEnabled()).toBe(true);
    });

    test("should coerce falsy values to false", () => {
      service.initialize();
      service.setCiLoggingEnabled(0);
      
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("isCiLoggingEnabled method", () => {
    test("should return the current CI logging state", () => {
      service.initialize();
      
      expect(service.isCiLoggingEnabled()).toBe(false);
      
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
    });
  });

  describe("detectCiLogging method", () => {
    test("should return true when window.__RWTRA_CI_MODE__ is true", () => {
      const originalWindow = global.window;
      global.window = { 
        __RWTRA_CI_MODE__: true,
        location: { search: "" }
      };

      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(true);
      
      global.window = originalWindow;
    });

    test("should return false when window.__RWTRA_CI_MODE__ is false", () => {
      const originalWindow = global.window;
      global.window = { 
        __RWTRA_CI_MODE__: false,
        location: { search: "" }
      };

      service.initialize();
      const result = service.detectCiLogging();
      
      expect(result).toBe(false);
      
      global.window = originalWindow;
    });

    test("should return true when ci query param is 1", () => {
      const locationOverride = { search: "?ci=1" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when ci query param is 'true'", () => {
      const locationOverride = { search: "?ci=true" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when ci query param is 'TRUE' (case insensitive)", () => {
      const locationOverride = { search: "?ci=TRUE" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return false when ci query param is invalid", () => {
      const locationOverride = { search: "?ci=invalid" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(false);
    });

    test("should return true when hostname is localhost", () => {
      const locationOverride = { search: "", hostname: "localhost" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when hostname is 127.0.0.1", () => {
      const locationOverride = { search: "", hostname: "127.0.0.1" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(true);
    });

    test("should return true when config.ciLogging is true", () => {
      service.initialize();
      const result = service.detectCiLogging({ ciLogging: true });
      
      expect(result).toBe(true);
    });

    test("should return false when no conditions are met", () => {
      const locationOverride = { search: "", hostname: "example.com" };
      
      service.initialize();
      const result = service.detectCiLogging(null, locationOverride);
      
      expect(result).toBe(false);
    });
  });

  describe("serializeForLog method", () => {
    test("should serialize Error objects properly", () => {
      const error = new Error("Test error");
      service.initialize();
      const result = service.serializeForLog(error);
      
      expect(result).toEqual({
        message: "Test error",
        stack: expect.any(String)
      });
    });

    test("should serialize regular objects", () => {
      const obj = { name: "test", value: 42 };
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    test("should handle nested objects", () => {
      const obj = { 
        user: { name: "John", age: 30 },
        settings: { theme: "dark" }
      };
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    test("should handle arrays", () => {
      const arr = [1, 2, 3, "test"];
      service.initialize();
      const result = service.serializeForLog(arr);
      
      expect(result).toEqual(arr);
    });

    test("should handle unserializable objects", () => {
      const obj = { };
      obj.circular = obj; // Creates circular reference
      
      service.initialize();
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual({
        type: "object",
        note: "unserializable"
      });
    });

    test("should return primitive values as-is", () => {
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
      service.initialize();
      
      const start = Date.now();
      await service.wait(10); // Wait for 10ms
      const end = Date.now();
      
      // The wait should take at least 10ms
      expect(end - start).toBeGreaterThanOrEqual(8); // Allow some tolerance
    });

    test("should resolve immediately when passed 0", async () => {
      service.initialize();
      
      const start = Date.now();
      await service.wait(0);
      const end = Date.now();
      
      // Should resolve quickly
      expect(end - start).toBeLessThan(100);
    });
  });

  describe("logClient method", () => {
    let originalConsole;
    let originalWindow;
    let originalNavigator;

    beforeEach(() => {
      originalConsole = global.console;
      originalWindow = global.window;
      originalNavigator = global.navigator;
      
      global.console = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    });

    afterEach(() => {
      global.console = originalConsole;
      global.window = originalWindow;
      global.navigator = originalNavigator;
    });

    test("should not log when CI logging is disabled and not an error level", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: jest.fn() };
      
      service.initialize();
      // CI logging is disabled by default
      service.logClient("test-event", { data: "test" });
      
      // Should not call sendBeacon when CI logging is disabled
      expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
    });

    test("should log error/warn events even when CI logging is disabled", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: jest.fn() };
      
      service.initialize();
      service.logClient("error-event", { data: "test" }, "error");
      
      // Should call sendBeacon for error events even when CI logging is disabled
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
    });

    test("should enable CI logging and send beacon when enabled", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: jest.fn() };
      
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" });
      
      expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
        "/logs",
        expect.any(Blob)
      );
    });

    test("should log to console with correct level", () => {
      global.window = { location: { href: "http://localhost" } };
      // No navigator to force fallback to fetch
      
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" }, "error");
      
      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "test" });
    });

    test("should use different console methods based on level", () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: jest.fn() };
      
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("info-event", { data: "test" }, "info");
      expect(global.console.info).toHaveBeenCalledWith("[bootstrap]", "info-event", { data: "test" });
      
      service.logClient("warn-event", { data: "test" }, "warn");
      expect(global.console.warn).toHaveBeenCalledWith("[bootstrap]", "warn-event", { data: "test" });
      
      service.logClient("error-event", { data: "test" }, "error");
      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "error-event", { data: "test" });
    });

    test("should fallback to fetch when sendBeacon is not available", async () => {
      global.window = { location: { href: "http://localhost" } };
      global.navigator = { sendBeacon: undefined }; // No sendBeacon
      global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
      
      service.initialize();
      service.setCiLoggingEnabled(true);
      service.logClient("test-event", { data: "test" });
      
      expect(global.fetch).toHaveBeenCalledWith(
        "/logs",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" }
        })
      );
      
      // Clean up
      delete global.fetch;
    });

    test("should not log when window is undefined", () => {
      // Don't set global.window
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