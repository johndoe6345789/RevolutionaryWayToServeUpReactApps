const LoggingService = require("../../../../../bootstrap/services/cdn/logging-service.js");
const LoggingServiceConfig = require("../../../../../bootstrap/configs/cdn/logging-service.js");
const ServiceRegistry = require("../../../../../bootstrap/services/service-registry.js");

describe("LoggingService", () => {
  describe("constructor", () => {
    test("should create an instance with default config when no config provided", () => {
      const service = new LoggingService();
      expect(service).toBeInstanceOf(LoggingService);
      expect(service.config).toBeInstanceOf(LoggingServiceConfig);
    });

    test("should create an instance with provided config", () => {
      const config = new LoggingServiceConfig();
      const service = new LoggingService(config);
      expect(service.config).toBe(config);
    });

    test("should inherit from BaseService", () => {
      const service = new LoggingService();
      expect(service).toHaveProperty('_ensureNotInitialized');
      expect(service).toHaveProperty('_markInitialized');
      expect(service).toHaveProperty('initialized');
    });
  });

  describe("static defaults property", () => {
    test("should return the shared logging defaults", () => {
      const defaults = LoggingService.defaults;
      expect(defaults).toBeDefined();
      expect(defaults).toHaveProperty('ciLogQueryParam');
      expect(defaults).toHaveProperty('clientLogEndpoint');
    });
  });

  describe("initialize method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should set up internal properties and mark as initialized", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
      expect(service.isCommonJs).toBeDefined();
      expect(service.initialized).toBe(true);
      expect(service.ciLoggingEnabled).toBe(false);
    });

    test("should set up bound methods", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      service.initialize();

      expect(typeof service.setCiLoggingEnabled).toBe('function');
      expect(typeof service.detectCiLogging).toBe('function');
      expect(typeof service.logClient).toBe('function');
      expect(typeof service.wait).toBe('function');
      expect(typeof service.serializeForLog).toBe('function');
      expect(typeof service.isCiLoggingEnabled).toBe('function');
    });

    test("should set up default configuration values", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      service.initialize();

      expect(service.ciLogQueryParam).toBe(LoggingService.defaults.ciLogQueryParam);
      expect(service.clientLogEndpoint).toBe(LoggingService.defaults.clientLogEndpoint);
    });

    test("should use config overrides for default values", () => {
      const overrides = {
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        ciLogQueryParam: "customParam",
        clientLogEndpoint: "/custom/log"
      };
      const config = new LoggingServiceConfig(overrides);
      const service = new LoggingService(config);

      service.initialize();

      expect(service.ciLogQueryParam).toBe("customParam");
      expect(service.clientLogEndpoint).toBe("/custom/log");
    });

    test("should register the service in the registry", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      service.initialize();

      expect(mockServiceRegistry.isRegistered("logging")).toBe(true);
      expect(mockServiceRegistry.getService("logging")).toBe(service);
    });

    test("should prevent double initialization", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      service.initialize();

      expect(() => service.initialize()).toThrow();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should toggle the CI logging enabled flag", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);

      service.setCiLoggingEnabled(false);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });

    test("should coerce the value to boolean", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      service.setCiLoggingEnabled("truthy");
      expect(service.isCiLoggingEnabled()).toBe(true);

      service.setCiLoggingEnabled(0);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("detectCiLogging method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should return window.__RWTRA_CI_MODE__ value if available", () => {
      const originalWindow = global.window;
      global.window = { __RWTRA_CI_MODE__: true };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from query params", () => {
      const originalWindow = global.window;
      global.window = { location: { search: "?ci=1" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from query params with 'true' value", () => {
      const originalWindow = global.window;
      global.window = { location: { search: "?ci=true" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from query params with 'TRUE' (case insensitive)", () => {
      const originalWindow = global.window;
      global.window = { location: { search: "?ci=TRUE" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from localhost hostname", () => {
      const originalWindow = global.window;
      global.window = { location: { hostname: "localhost", search: "" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from 127.0.0.1 hostname", () => {
      const originalWindow = global.window;
      global.window = { location: { hostname: "127.0.0.1", search: "" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    test("should detect CI logging from config override", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging({ ciLogging: true });
      expect(result).toBe(true);
    });

    test("should return false when no conditions are met", () => {
      const originalWindow = global.window;
      global.window = { location: { hostname: "example.com", search: "" } };
      
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const result = service.detectCiLogging();
      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe("serializeForLog method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should serialize Error objects properly", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const error = new Error("Test error");
      const result = service.serializeForLog(error);

      expect(result).toHaveProperty('message', "Test error");
      expect(result).toHaveProperty('stack');
      expect(typeof result.stack).toBe('string');
    });

    test("should serialize regular objects", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const obj = { name: "test", value: 42 };
      const result = service.serializeForLog(obj);

      expect(result).toEqual(obj);
    });

    test("should handle unserializable objects", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const obj = { 
        name: "test",
        circular: null 
      };
      obj.circular = obj; // Create circular reference
      
      const result = service.serializeForLog(obj);

      expect(result).toHaveProperty('type', 'object');
      expect(result).toHaveProperty('note', 'unserializable');
    });

    test("should return primitives as-is", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      expect(service.serializeForLog("string")).toBe("string");
      expect(service.serializeForLog(42)).toBe(42);
      expect(service.serializeForLog(true)).toBe(true);
      expect(service.serializeForLog(null)).toBe(null);
      expect(service.serializeForLog(undefined)).toBe(undefined);
    });
  });

  describe("wait method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should return a promise that resolves after specified time", async () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const startTime = Date.now();
      await service.wait(10);
      const endTime = Date.now();

      // Allow some tolerance for timing variations
      expect(endTime - startTime).toBeGreaterThanOrEqual(8);
    });

    test("should resolve immediately when passed 0", async () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      const startTime = Date.now();
      await service.wait(0);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe("logClient method", () => {
    let mockNamespace, mockServiceRegistry, originalWindow, originalConsole, originalNavigator;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
      originalWindow = global.window;
      originalConsole = global.console;
      originalNavigator = global.navigator;

      global.window = {
        location: { href: "http://localhost/test", hostname: "localhost" },
        navigator: { sendBeacon: jest.fn(() => true) }
      };
      global.console = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
      global.navigator = global.window.navigator;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.console = originalConsole;
      global.navigator = originalNavigator;
    });

    test("should send log data via sendBeacon when CI logging is enabled", () => {
      const config = new LoggingServiceConfig({
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        clientLogEndpoint: "/logs"
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(true);

      service.logClient("test-event", { data: "value" });

      expect(global.window.navigator.sendBeacon).toHaveBeenCalled();
    });

    test("should not send logs when CI logging is disabled and not an error level", () => {
      const config = new LoggingServiceConfig({
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        clientLogEndpoint: "/logs"
      });
      const service = new LoggingService(config);
      service.initialize();

      service.logClient("test-event", { data: "value" }, "info");

      expect(global.window.navigator.sendBeacon).not.toHaveBeenCalled();
    });

    test("should send error level logs even when CI logging is disabled", () => {
      const config = new LoggingServiceConfig({
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        clientLogEndpoint: "/logs"
      });
      const service = new LoggingService(config);
      service.initialize();

      service.logClient("error-event", { data: "value" }, "error");

      expect(global.window.navigator.sendBeacon).toHaveBeenCalled();
    });

    test("should log error/warn to console even when CI logging is disabled", () => {
      const config = new LoggingServiceConfig({
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        clientLogEndpoint: "/logs"
      });
      const service = new LoggingService(config);
      service.initialize();

      service.logClient("test-error", { data: "value" }, "error");

      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-error", { data: "value" });
    });

    test("should use appropriate console method based on level", () => {
      const config = new LoggingServiceConfig({
        namespace: mockNamespace,
        serviceRegistry: mockServiceRegistry,
        clientLogEndpoint: "/logs"
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(true); // Enable CI logging to ensure console logging happens

      service.logClient("test-error", { data: "value" }, "error");
      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-error", { data: "value" });

      service.logClient("test-warn", { data: "value" }, "warn");
      expect(global.console.warn).toHaveBeenCalledWith("[bootstrap]", "test-warn", { data: "value" });

      service.logClient("test-info", { data: "value" }, "info");
      expect(global.console.info).toHaveBeenCalledWith("[bootstrap]", "test-info", { data: "value" });
    });
  });

  describe("isCiLoggingEnabled method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should return the current CI logging enabled state", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      expect(service.isCiLoggingEnabled()).toBe(false);

      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
    });
  });

  describe("integration", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should work through full lifecycle", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);

      // Initialize
      service.initialize();
      expect(service.initialized).toBe(true);

      // Test functionality
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);

      // Verify it's registered
      expect(mockServiceRegistry.isRegistered("logging")).toBe(true);
      expect(mockServiceRegistry.getService("logging")).toBe(service);
    });

    test("should handle complete logging flow", () => {
      const config = new LoggingServiceConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new LoggingService(config);
      service.initialize();

      // Test serialization
      const error = new Error("test");
      const serialized = service.serializeForLog(error);
      expect(serialized).toHaveProperty('message', 'test');

      // Test CI detection
      const ciDetected = service.detectCiLogging({ ciLogging: true });
      expect(ciDetected).toBe(true);
    });
  });
});