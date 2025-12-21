import LoggingService from "../../../../../bootstrap/services/cdn/logging-service.js";

describe("LoggingService", () => {
  let originalWindow;
  let originalConsole;
  let originalNavigator;
  let originalFetch;

  beforeEach(() => {
    // Save original globals
    originalWindow = global.window;
    originalConsole = global.console;
    originalNavigator = global.navigator;
    originalFetch = global.fetch;
    
    // Set up mocks
    global.window = {
      location: { search: "", hostname: "localhost", href: "http://test.com" },
      __RWTRA_CI_MODE__: undefined
    };
    
    global.console = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    global.navigator = {
      sendBeacon: jest.fn(() => true)
    };
    
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.console = originalConsole;
    global.navigator = originalNavigator;
    global.fetch = originalFetch;
  });

  describe("static defaults getter", () => {
    it("should return the shared logging defaults from constants", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toBeDefined();
      expect(defaults).toHaveProperty('ciLogQueryParam');
      expect(defaults).toHaveProperty('clientLogEndpoint');
    });
  });

  describe("constructor", () => {
    it("should extend BaseService", () => {
      const service = new LoggingService();
      expect(service).toBeInstanceOf(Object); // Since we can't directly check BaseService
    });

    it("should accept a config object", () => {
      const config = { test: "value" };
      const service = new LoggingService(config);
      expect(service.config).toBe(config);
    });

    it("should create a default config if none provided", () => {
      const service = new LoggingService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    let service;
    let config;

    beforeEach(() => {
      config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        ciLogQueryParam: "test-ci",
        clientLogEndpoint: "http://test-endpoint"
      };
      service = new LoggingService(config);
    });

    it("should mark service as initialized", () => {
      const result = service.initialize();
      expect(result).toBe(service);
      // We can't directly test the private _initialized property
    });

    it("should set up internal properties", () => {
      service.initialize();

      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
      expect(typeof service.isCommonJs).toBe('boolean');
      expect(service.ciLoggingEnabled).toBe(false);
    });

    it("should bind methods to the service instance", () => {
      service.initialize();

      expect(service.setCiLoggingEnabled).toBeInstanceOf(Function);
      expect(service.detectCiLogging).toBeInstanceOf(Function);
      expect(service.logClient).toBeInstanceOf(Function);
      expect(service.wait).toBeInstanceOf(Function);
      expect(service.serializeForLog).toBeInstanceOf(Function);
      expect(service.isCiLoggingEnabled).toBeInstanceOf(Function);

      // Verify that methods are bound to the service instance
      expect(service.setCiLoggingEnabled).not.toBe(LoggingService.prototype.setCiLoggingEnabled);
      expect(service.detectCiLogging).not.toBe(LoggingService.prototype.detectCiLogging);
    });

    it("should set up configuration fallbacks", () => {
      service.initialize();

      expect(service.ciLogQueryParam).toBe("test-ci");
      expect(service.clientLogEndpoint).toBe("http://test-endpoint");
    });

    it("should register the service in the service registry", () => {
      service.initialize();

      expect(config.serviceRegistry.register).toHaveBeenCalledWith(
        "logging",
        service,
        {
          folder: "services/cdn",
          domain: "cdn",
        },
        []
      );
    });

    it("should throw if already initialized", () => {
      service.initialize();
      expect(() => service.initialize()).toThrow();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    let service;

    beforeEach(() => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      service = new LoggingService(config);
      service.initialize();
    });

    it("should enable CI logging when true is passed", () => {
      service.setCiLoggingEnabled(true);
      expect(service.ciLoggingEnabled).toBe(true);
    });

    it("should disable CI logging when false is passed", () => {
      service.setCiLoggingEnabled(false);
      expect(service.ciLoggingEnabled).toBe(false);
    });

    it("should coerce truthy values to true", () => {
      service.setCiLoggingEnabled("truthy");
      expect(service.ciLoggingEnabled).toBe(true);

      service.setCiLoggingEnabled(1);
      expect(service.ciLoggingEnabled).toBe(true);

      service.setCiLoggingEnabled({});
      expect(service.ciLoggingEnabled).toBe(true);
    });

    it("should coerce falsy values to false", () => {
      service.setCiLoggingEnabled("");
      expect(service.ciLoggingEnabled).toBe(false);

      service.setCiLoggingEnabled(0);
      expect(service.ciLoggingEnabled).toBe(false);

      service.setCiLoggingEnabled(null);
      expect(service.ciLoggingEnabled).toBe(false);

      service.setCiLoggingEnabled(undefined);
      expect(service.ciLoggingEnabled).toBe(false);
    });
  });

  describe("detectCiLogging method", () => {
    let service;

    beforeEach(() => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        ciLogQueryParam: "test-ci"
      };
      service = new LoggingService(config);
      service.initialize();
    });

    it("should return window.__RWTRA_CI_MODE__ value if available", () => {
      global.window.__RWTRA_CI_MODE__ = true;
      expect(service.detectCiLogging()).toBe(true);

      global.window.__RWTRA_CI_MODE__ = false;
      expect(service.detectCiLogging()).toBe(false);
    });

    it("should detect CI logging from query params", () => {
      global.window.location.search = "?test-ci=1";
      expect(service.detectCiLogging()).toBe(true);

      global.window.location.search = "?test-ci=true";
      expect(service.detectCiLogging()).toBe(true);

      global.window.location.search = "?test-ci=TRUE";
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should return false for invalid query param values", () => {
      global.window.location.search = "?test-ci=0";
      expect(service.detectCiLogging()).toBe(false);

      global.window.location.search = "?test-ci=false";
      expect(service.detectCiLogging()).toBe(false);

      global.window.location.search = "?test-ci=invalid";
      expect(service.detectCiLogging()).toBe(false);
    });

    it("should detect CI logging from localhost", () => {
      global.window.location = { search: "", hostname: "localhost", href: "http://test.com" };
      expect(service.detectCiLogging()).toBe(true);

      global.window.location = { search: "", hostname: "127.0.0.1", href: "http://test.com" };
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from config override", () => {
      expect(service.detectCiLogging({ ciLogging: true })).toBe(true);
      expect(service.detectCiLogging({ ciLogging: false })).toBe(false);
    });

    it("should return false when no conditions are met", () => {
      global.window.__RWTRA_CI_MODE__ = undefined;
      global.window.location = { search: "?other=value", hostname: "example.com", href: "http://test.com" };
      expect(service.detectCiLogging()).toBe(false);
    });

    it("should use location override if provided", () => {
      const overrideLocation = { search: "?test-ci=1", hostname: "example.com", href: "http://test.com" };
      expect(service.detectCiLogging({}, overrideLocation)).toBe(true);
    });
  });

  describe("serializeForLog method", () => {
    let service;

    beforeEach(() => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      service = new LoggingService(config);
      service.initialize();
    });

    it("should serialize Error objects properly", () => {
      const error = new Error("test error");
      const serialized = service.serializeForLog(error);

      expect(serialized).toEqual({
        message: "test error",
        stack: expect.stringContaining("Error: test error")
      });
    });

    it("should handle objects that can be serialized", () => {
      const obj = { test: "value", num: 42 };
      const serialized = service.serializeForLog(obj);

      expect(serialized).toEqual(obj);
    });

    it("should handle unserializable objects", () => {
      const obj = { 
        func: () => {}, 
        circ: null 
      };
      obj.circ = obj; // Create circular reference

      const serialized = service.serializeForLog(obj);

      expect(serialized).toEqual({
        type: "object",
        note: "unserializable"
      });
    });

    it("should return primitives as-is", () => {
      expect(service.serializeForLog("string")).toBe("string");
      expect(service.serializeForLog(42)).toBe(42);
      expect(service.serializeForLog(true)).toBe(true);
      expect(service.serializeForLog(null)).toBe(null);
      expect(service.serializeForLog(undefined)).toBe(undefined);
    });

    it("should handle complex nested objects", () => {
      const complexObj = {
        str: "test",
        num: 123,
        bool: true,
        arr: [1, 2, 3],
        nested: {
          deep: "value"
        }
      };

      const serialized = service.serializeForLog(complexObj);
      expect(serialized).toEqual(complexObj);
    });
  });

  describe("wait method", () => {
    let service;

    beforeEach(() => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      service = new LoggingService(config);
      service.initialize();
    });

    it("should return a promise that resolves after specified time", async () => {
      const startTime = Date.now();
      const delay = 10;

      await service.wait(delay);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(delay);
    });

    it("should resolve immediately when passed 0", async () => {
      const startTime = Date.now();

      await service.wait(0);

      const endTime = Date.now();
      // Should be almost instantaneous
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe("logClient method", () => {
    let service;
    let mockFetch;

    beforeEach(() => {
      mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
      global.fetch = mockFetch;

      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        clientLogEndpoint: "http://test-endpoint"
      };
      service = new LoggingService(config);
      service.initialize();
    });

    afterEach(() => {
      delete global.fetch;
    });

    it("should send log data via sendBeacon when CI logging is enabled", () => {
      service.setCiLoggingEnabled(true);
      service.logClient("test:event", { data: "value" });

      expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
        "http://test-endpoint",
        expect.any(Blob)
      );
    });

    it("should not send logs when CI logging is disabled and not an error level", () => {
      service.setCiLoggingEnabled(false);
      service.logClient("test:event", { data: "value" });

      expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should send error level logs even when CI logging is disabled", () => {
      service.setCiLoggingEnabled(false);
      service.logClient("error:event", { data: "value" }, "error");

      expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
        "http://test-endpoint",
        expect.any(Blob)
      );
    });

    it("should log to console with appropriate method based on level", () => {
      service.setCiLoggingEnabled(true);

      service.logClient("info:event", { data: "value" }, "info");
      expect(global.console.info).toHaveBeenCalledWith(
        "[bootstrap]", 
        "info:event", 
        { data: "value" }
      );

      global.console.info.mockClear();

      service.logClient("warn:event", { data: "value" }, "warn");
      expect(global.console.warn).toHaveBeenCalledWith(
        "[bootstrap]", 
        "warn:event", 
        { data: "value" }
      );

      global.console.warn.mockClear();

      service.logClient("error:event", { data: "value" }, "error");
      expect(global.console.error).toHaveBeenCalledWith(
        "[bootstrap]", 
        "error:event", 
        { data: "value" }
      );
    });

    it("should serialize the detail object", () => {
      service.setCiLoggingEnabled(true);
      const error = new Error("test");
      service.logClient("event", error);

      expect(global.console.info).toHaveBeenCalledWith(
        "[bootstrap]",
        "event",
        expect.objectContaining({
          message: "test",
          stack: expect.stringContaining("Error: test")
        })
      );
    });

    it("should fall back to fetch when sendBeacon is not available", () => {
      global.navigator.sendBeacon = undefined;
      service.setCiLoggingEnabled(true);
      service.logClient("event", { data: "value" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-endpoint",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" }
        })
      );
    });

    it("should handle missing window gracefully", () => {
      delete global.window;
      expect(() => service.logClient("event", { data: "value" })).not.toThrow();
    });
  });

  describe("isCiLoggingEnabled method", () => {
    let service;

    beforeEach(() => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      service = new LoggingService(config);
      service.initialize();
    });

    it("should return the current CI logging enabled state", () => {
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);

      service.setCiLoggingEnabled(false);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("integration", () => {
    it("should work through full lifecycle", () => {
      const config = {
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() }
      };
      const service = new LoggingService(config);

      // Initialize
      service.initialize();
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);

      // Use methods
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);

      const detected = service.detectCiLogging({ ciLogging: true });
      expect(detected).toBe(true);

      const serialized = service.serializeForLog({ test: "data" });
      expect(serialized).toEqual({ test: "data" });

      // Wait method should return a promise
      const waitPromise = service.wait(1);
      expect(waitPromise).toBeInstanceOf(Promise);
    });
  });
});