import LoggingService from "../../../../bootstrap/services/cdn/logging-service.js";
import NetworkService from "../../../../bootstrap/services/cdn/network-service.js";
import DynamicModulesService from "../../../../bootstrap/services/cdn/dynamic-modules-service.js";

describe("CDN Helper Services - Specific Comprehensive Tests", () => {
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
    
    // Set up mock globals
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
    
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.console = originalConsole;
    global.navigator = originalNavigator;
    global.fetch = originalFetch;
  });

  describe("LoggingService specific tests", () => {
    let loggingService;
    let mockConfig;
    let mockServiceRegistry;
    let mockNamespace;

    beforeEach(() => {
      mockServiceRegistry = { register: jest.fn() };
      mockNamespace = { helpers: {} };
      mockConfig = {
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        ciLogQueryParam: "test-ci",
        clientLogEndpoint: "/api/log"
      };
      loggingService = new LoggingService(mockConfig);
    });

    describe("constructor and initialization", () => {
      it("should create an instance with provided configuration", () => {
        expect(loggingService.config).toBe(mockConfig);
      });

      it("should initialize internal properties correctly", () => {
        loggingService.initialize();
        
        expect(loggingService.namespace).toBe(mockConfig.namespace);
        expect(loggingService.helpers).toBe(mockConfig.namespace.helpers);
        expect(typeof loggingService.isCommonJs).toBe('boolean');
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });

      it("should bind all methods to the service instance", () => {
        loggingService.initialize();
        
        expect(loggingService.setCiLoggingEnabled).toBeInstanceOf(Function);
        expect(loggingService.detectCiLogging).toBeInstanceOf(Function);
        expect(loggingService.logClient).toBeInstanceOf(Function);
        expect(loggingService.wait).toBeInstanceOf(Function);
        expect(loggingService.serializeForLog).toBeInstanceOf(Function);
        expect(loggingService.isCiLoggingEnabled).toBeInstanceOf(Function);
      });

      it("should register the service in the service registry", () => {
        loggingService.initialize();
        
        expect(mockServiceRegistry.register).toHaveBeenCalledWith(
          "logging",
          loggingService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should prevent double initialization", () => {
        loggingService.initialize();
        expect(() => loggingService.initialize()).toThrow();
      });
    });

    describe("setCiLoggingEnabled method", () => {
      beforeEach(() => {
        loggingService.initialize();
      });

      it("should enable CI logging when passed true", () => {
        loggingService.setCiLoggingEnabled(true);
        expect(loggingService.ciLoggingEnabled).toBe(true);
      });

      it("should disable CI logging when passed false", () => {
        loggingService.setCiLoggingEnabled(false);
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });

      it("should properly coerce truthy values to true", () => {
        loggingService.setCiLoggingEnabled("yes");
        expect(loggingService.ciLoggingEnabled).toBe(true);
        
        loggingService.setCiLoggingEnabled(1);
        expect(loggingService.ciLoggingEnabled).toBe(true);
        
        loggingService.setCiLoggingEnabled({});
        expect(loggingService.ciLoggingEnabled).toBe(true);
      });

      it("should properly coerce falsy values to false", () => {
        loggingService.setCiLoggingEnabled("");
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(0);
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(null);
        expect(loggingService.ciLoggingEnabled).toBe(false);
        
        loggingService.setCiLoggingEnabled(undefined);
        expect(loggingService.ciLoggingEnabled).toBe(false);
      });
    });

    describe("detectCiLogging method", () => {
      beforeEach(() => {
        loggingService.initialize();
      });

      it("should return window.__RWTRA_CI_MODE__ value when available", () => {
        global.window.__RWTRA_CI_MODE__ = true;
        expect(loggingService.detectCiLogging()).toBe(true);
        
        global.window.__RWTRA_CI_MODE__ = false;
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should detect CI logging from query parameter with value '1'", () => {
        global.window.location.search = "?test-ci=1";
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should detect CI logging from query parameter with value 'true'", () => {
        global.window.location.search = "?test-ci=true";
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should detect CI logging from query parameter with value 'TRUE' (case insensitive)", () => {
        global.window.location.search = "?test-ci=TRUE";
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should return false for invalid query parameter values", () => {
        global.window.location.search = "?test-ci=0";
        expect(loggingService.detectCiLogging()).toBe(false);
        
        global.window.location.search = "?test-ci=false";
        expect(loggingService.detectCiLogging()).toBe(false);
        
        global.window.location.search = "?test-ci=invalid";
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should detect CI logging from localhost hostname", () => {
        global.window.location = { search: "", hostname: "localhost", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should detect CI logging from 127.0.0.1 hostname", () => {
        global.window.location = { search: "", hostname: "127.0.0.1", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(true);
      });

      it("should detect CI logging from config override", () => {
        expect(loggingService.detectCiLogging({ ciLogging: true })).toBe(true);
        expect(loggingService.detectCiLogging({ ciLogging: false })).toBe(false);
      });

      it("should return false when no CI conditions are met", () => {
        global.window.__RWTRA_CI_MODE__ = undefined;
        global.window.location = { search: "?other=value", hostname: "example.com", href: "http://test.com" };
        expect(loggingService.detectCiLogging()).toBe(false);
      });

      it("should use location override when provided", () => {
        const overrideLocation = { search: "?test-ci=1", hostname: "example.com", href: "http://test.com" };
        expect(loggingService.detectCiLogging({}, overrideLocation)).toBe(true);
      });
    });

    describe("serializeForLog method", () => {
      beforeEach(() => {
        loggingService.initialize();
      });

      it("should properly serialize Error objects with message and stack", () => {
        const error = new Error("test error message");
        const serialized = loggingService.serializeForLog(error);
        
        expect(serialized).toEqual({
          message: "test error message",
          stack: expect.stringContaining("Error: test error message")
        });
      });

      it("should handle serializable objects", () => {
        const obj = { test: "value", num: 42, bool: true };
        const serialized = loggingService.serializeForLog(obj);
        
        expect(serialized).toEqual(obj);
      });

      it("should handle unserializable objects by returning type and note", () => {
        const obj = { 
          func: () => {}, 
          circ: null 
        };
        obj.circ = obj; // Create circular reference
        
        const serialized = loggingService.serializeForLog(obj);
        
        expect(serialized).toEqual({
          type: "object",
          note: "unserializable"
        });
      });

      it("should return primitive values as-is", () => {
        expect(loggingService.serializeForLog("string")).toBe("string");
        expect(loggingService.serializeForLog(42)).toBe(42);
        expect(loggingService.serializeForLog(true)).toBe(true);
        expect(loggingService.serializeForLog(null)).toBe(null);
        expect(loggingService.serializeForLog(undefined)).toBe(undefined);
      });

      it("should handle complex nested objects", () => {
        const complexObj = {
          str: "test",
          num: 123,
          bool: true,
          arr: [1, 2, 3],
          nested: {
            deep: { value: "deep" }
          }
        };
        
        const serialized = loggingService.serializeForLog(complexObj);
        expect(serialized).toEqual(complexObj);
      });
    });

    describe("wait method", () => {
      beforeEach(() => {
        loggingService.initialize();
      });

      it("should return a promise that resolves after the specified time", async () => {
        const startTime = Date.now();
        const delay = 10;
        
        await loggingService.wait(delay);
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(delay);
      });

      it("should resolve immediately when passed 0", async () => {
        const startTime = Date.now();
        
        await loggingService.wait(0);
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(10); // Should be nearly instantaneous
      });
    });

    describe("logClient method", () => {
      let mockFetch;

      beforeEach(() => {
        mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
        global.fetch = mockFetch;
        
        loggingService = new LoggingService(mockConfig);
        loggingService.initialize();
        loggingService.setCiLoggingEnabled(true); // Enable CI logging
      });

      afterEach(() => {
        delete global.fetch;
      });

      it("should send log data via sendBeacon when CI logging is enabled", () => {
        loggingService.logClient("test:event", { data: "value" });
        
        expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
          "/api/log",
          expect.any(Blob)
        );
      });

      it("should not send logs when CI logging is disabled and level is not error/warn", () => {
        loggingService.setCiLoggingEnabled(false);
        loggingService.logClient("test:event", { data: "value" });
        
        expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it("should send error level logs even when CI logging is disabled", () => {
        loggingService.setCiLoggingEnabled(false);
        loggingService.logClient("error:event", { data: "value" }, "error");
        
        expect(global.navigator.sendBeacon).toHaveBeenCalledWith(
          "/api/log",
          expect.any(Blob)
        );
      });

      it("should log to console with appropriate method based on level", () => {
        loggingService.setCiLoggingEnabled(true);
        
        // Test info level
        loggingService.logClient("info:event", { data: "value" }, "info");
        expect(global.console.info).toHaveBeenCalledWith(
          "[bootstrap]", 
          "info:event", 
          { data: "value" }
        );
        
        global.console.info.mockClear();
        
        // Test warn level
        loggingService.logClient("warn:event", { data: "value" }, "warn");
        expect(global.console.warn).toHaveBeenCalledWith(
          "[bootstrap]", 
          "warn:event", 
          { data: "value" }
        );
        
        global.console.warn.mockClear();
        
        // Test error level
        loggingService.logClient("error:event", { data: "value" }, "error");
        expect(global.console.error).toHaveBeenCalledWith(
          "[bootstrap]", 
          "error:event", 
          { data: "value" }
        );
      });

      it("should serialize the detail object before sending", () => {
        loggingService.setCiLoggingEnabled(true);
        const error = new Error("test error");
        loggingService.logClient("event", error);
        
        expect(global.console.info).toHaveBeenCalledWith(
          "[bootstrap]",
          "event",
          expect.objectContaining({
            message: "test error",
            stack: expect.stringContaining("Error: test error")
          })
        );
      });

      it("should fall back to fetch when sendBeacon is not available", () => {
        global.navigator.sendBeacon = undefined;
        loggingService.setCiLoggingEnabled(true);
        loggingService.logClient("event", { data: "value" });
        
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/log",
          expect.objectContaining({
            method: "POST",
            headers: { "content-type": "application/json" }
          })
        );
      });

      it("should handle missing window gracefully", () => {
        delete global.window;
        expect(() => loggingService.logClient("event", { data: "value" })).not.toThrow();
      });
    });

    describe("isCiLoggingEnabled method", () => {
      beforeEach(() => {
        loggingService.initialize();
      });

      it("should return the current CI logging enabled state", () => {
        loggingService.setCiLoggingEnabled(true);
        expect(loggingService.isCiLoggingEnabled()).toBe(true);
        
        loggingService.setCiLoggingEnabled(false);
        expect(loggingService.isCiLoggingEnabled()).toBe(false);
      });
    });

    describe("integration tests", () => {
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
        
        // Service should be registered
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
    });
  });

  describe("NetworkService specific tests", () => {
    let networkService;
    let mockConfig;
    let mockServiceRegistry;
    let mockNamespace;

    beforeEach(() => {
      mockServiceRegistry = { register: jest.fn() };
      mockNamespace = { helpers: {} };
      mockConfig = {
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry
      };
      networkService = new NetworkService(mockConfig);
    });

    describe("constructor and initialization", () => {
      it("should create an instance with provided config", () => {
        expect(networkService.config).toBe(mockConfig);
      });

      it("should initialize internal services", () => {
        networkService.initialize();
        
        expect(networkService.providerService).toBeDefined();
        expect(networkService.probeService).toBeDefined();
        expect(networkService.moduleResolver).toBeDefined();
      });

      it("should bind service methods to exports", () => {
        networkService.initialize();
        
        // Provider service methods
        expect(networkService.setFallbackProviders).toBeInstanceOf(Function);
        expect(networkService.getFallbackProviders).toBeInstanceOf(Function);
        expect(networkService.setDefaultProviderBase).toBeInstanceOf(Function);
        expect(networkService.getDefaultProviderBase).toBeInstanceOf(Function);
        expect(networkService.setProviderAliases).toBeInstanceOf(Function);
        expect(networkService.normalizeProxyMode).toBeInstanceOf(Function);
        expect(networkService.getProxyMode).toBeInstanceOf(Function);
        expect(networkService.isCiLikeHost).toBeInstanceOf(Function);
        expect(networkService.normalizeProviderBase).toBeInstanceOf(Function);
        expect(networkService.resolveProvider).toBeInstanceOf(Function);
        
        // Probe service methods
        expect(networkService.loadScript).toBeInstanceOf(Function);
        expect(networkService.shouldRetryStatus).toBeInstanceOf(Function);
        expect(networkService.probeUrl).toBeInstanceOf(Function);
        
        // Module resolver methods
        expect(networkService.resolveModuleUrl).toBeInstanceOf(Function);
      });

      it("should register the service in the service registry", () => {
        networkService.initialize();
        
        expect(mockServiceRegistry.register).toHaveBeenCalledWith(
          "network",
          networkService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should prevent double initialization", () => {
        networkService.initialize();
        expect(() => networkService.initialize()).toThrow();
      });
    });
  });

  describe("DynamicModulesService specific tests", () => {
    let dynamicModulesService;
    let mockConfig;
    let mockServiceRegistry;
    let mockNamespace;

    beforeEach(() => {
      mockServiceRegistry = { register: jest.fn() };
      mockNamespace = { helpers: {} };
      mockConfig = {
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry
      };
      dynamicModulesService = new DynamicModulesService(mockConfig);
    });

    describe("constructor and initialization", () => {
      it("should create an instance with provided config", () => {
        expect(dynamicModulesService.config).toBe(mockConfig);
      });

      it("should initialize internal properties", () => {
        const result = dynamicModulesService.initialize();
        expect(result).toBe(dynamicModulesService);
        expect(dynamicModulesService.serviceRegistry).toBe(mockConfig.serviceRegistry);
        expect(dynamicModulesService.helpers).toBe(mockConfig.namespace.helpers);
        expect(typeof dynamicModulesService.isCommonJs).toBe('boolean');
      });

      it("should register the service in the service registry", () => {
        dynamicModulesService.initialize();
        
        expect(mockServiceRegistry.register).toHaveBeenCalledWith(
          "dynamicModules",
          dynamicModulesService,
          {
            folder: "services/cdn",
            domain: "cdn",
          },
          []
        );
      });

      it("should prevent double initialization", () => {
        dynamicModulesService.initialize();
        expect(() => dynamicModulesService.initialize()).toThrow();
      });
    });
  });
});