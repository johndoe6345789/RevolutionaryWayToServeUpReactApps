import LoggingService from "../../../../bootstrap/services/cdn/logging-service.js";
import BaseService from "../../../../bootstrap/services/base-service.js";
import LoggingServiceConfig from "../../../../bootstrap/configs/cdn/logging-service.js";

// Mock dependencies
jest.mock("../../../../bootstrap/services/base-service.js");
jest.mock("../../../../bootstrap/configs/cdn/logging-service.js");

describe("LoggingService", () => {
  let mockConfig;
  let mockNamespace;
  let mockServiceRegistry;
  let originalConsole;
  let originalWindow;
  let originalNavigator;

  beforeEach(() => {
    // Save originals
    originalConsole = global.console;
    originalWindow = global.window;
    originalNavigator = global.navigator;
    
    // Setup mocks
    mockNamespace = { helpers: {} };
    mockServiceRegistry = { register: jest.fn() };
    mockConfig = {
      namespace: mockNamespace,
      serviceRegistry: mockServiceRegistry,
      ciLogQueryParam: "test-ci",
      clientLogEndpoint: "http://test-endpoint"
    };
    
    global.console = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    global.window = {
      location: { search: "?test-ci=true", hostname: "localhost", href: "http://test.com" },
      __RWTRA_CI_MODE__: undefined
    };
    
    global.navigator = {
      sendBeacon: jest.fn(() => true)
    };
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore originals
    global.console = originalConsole;
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  describe("static defaults getter", () => {
    it("should return the shared logging defaults from constants", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toBeDefined();
    });

    it("should return the expected default values", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toHaveProperty('ciLogQueryParam');
      expect(defaults).toHaveProperty('clientLogEndpoint');
    });
  });

  describe("constructor", () => {
    it("should extend BaseService", () => {
      const service = new LoggingService();
      expect(service).toBeInstanceOf(BaseService);
    });

    it("should accept a config and pass to parent constructor", () => {
      const config = new LoggingServiceConfig();
      const service = new LoggingService(config);
      expect(BaseService).toHaveBeenCalledWith(config);
    });

    it("should create a default config if none provided", () => {
      new LoggingService();
      expect(LoggingServiceConfig).toHaveBeenCalled();
    });
  });

  describe("initialize method", () => {
    let service;

    beforeEach(() => {
      service = new LoggingService(mockConfig);
    });

    it("should mark service as initialized", () => {
      const result = service.initialize();
      expect(result).toBe(service);
      // We can't easily test the private _initialized property directly
    });

    it("should set up internal properties", () => {
      service.initialize();
      
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
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
      
      // Verify binding worked
      expect(service.setCiLoggingEnabled).not.toBe(LoggingService.prototype.setCiLoggingEnabled);
      expect(service.detectCiLogging).not.toBe(LoggingService.prototype.detectCiLogging);
    });

    it("should set up configuration fallbacks", () => {
      const configWithDefaults = {
        ...mockConfig,
        ciLogQueryParam: undefined,
        clientLogEndpoint: undefined
      };
      const serviceWithDefaults = new LoggingService(configWithDefaults);
      serviceWithDefaults.initialize();
      
      expect(serviceWithDefaults.ciLogQueryParam).toBeDefined();
      expect(serviceWithDefaults.clientLogEndpoint).toBeDefined();
    });

    it("should require service registry", () => {
      service.initialize();
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
    });

    it("should register the service in the service registry", () => {
      service.initialize();
      
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "logging",
        service,
        {
          folder: "services/cdn",
          domain: "cdn",
        }
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
      service = new LoggingService(mockConfig);
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
      service = new LoggingService(mockConfig);
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
      service = new LoggingService(mockConfig);
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
      service = new LoggingService(mockConfig);
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

    it("should work with different delay values", async () => {
      const delays = [1, 5, 10];
      
      for (const delay of delays) {
        const startTime = Date.now();
        await service.wait(delay);
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(delay - 1); // Allow 1ms tolerance
      }
    });
  });

  describe("logClient method", () => {
    let service;
    let mockFetch;

    beforeEach(() => {
      mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
      global.fetch = mockFetch;
      
      service = new LoggingService(mockConfig);
      service.initialize();
      service.setCiLoggingEnabled(true); // Enable CI logging
    });

    afterEach(() => {
      delete global.fetch;
    });

    it("should send log data via sendBeacon when CI logging is enabled", () => {
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

    it("should handle missing window gracefully", () => {
      delete global.window;
      expect(() => service.logClient("event", { data: "value" })).not.toThrow();
    });

    it("should handle missing navigator gracefully", () => {
      delete global.navigator;
      service.logClient("event", { data: "value" });
      
      // Should fall back to fetch
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-endpoint",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" }
        })
      );
    });

    it("should handle navigator.sendBeacon failure by falling back to fetch", () => {
      global.navigator.sendBeacon = jest.fn(() => false);
      service.logClient("event", { data: "value" });
      
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("isCiLoggingEnabled method", () => {
    let service;

    beforeEach(() => {
      service = new LoggingService(mockConfig);
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
      const service = new LoggingService(mockConfig);
      
      // Initialize
      expect(() => service.initialize()).not.toThrow();
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
      
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