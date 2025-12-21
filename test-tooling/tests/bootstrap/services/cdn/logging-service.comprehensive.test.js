const LoggingService = require("../../../../../bootstrap/services/cdn/logging-service.js");
const LoggingServiceConfig = require("../../../../../bootstrap/configs/cdn/logging-service.js");

describe("LoggingService", () => {
  let originalWindow;
  let originalNavigator;
  let originalConsole;

  beforeEach(() => {
    // Store original globals
    originalWindow = global.window;
    originalNavigator = global.navigator;
    originalConsole = global.console;

    // Setup mock window
    global.window = {
      location: {
        search: "",
        hostname: "localhost",
        href: "http://localhost"
      },
      document: {}
    };

    // Setup mock navigator
    global.navigator = {
      sendBeacon: jest.fn(() => true)
    };

    // Setup mock console
    global.console = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.navigator = originalNavigator;
    global.console = originalConsole;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance with default config when no config provided", () => {
      const service = new LoggingService();
      
      expect(service).toBeInstanceOf(LoggingService);
      expect(service.config).toBeInstanceOf(LoggingServiceConfig);
    });

    it("should create an instance with provided config", () => {
      const config = new LoggingServiceConfig({ ciLogQueryParam: "custom" });
      const service = new LoggingService(config);
      
      expect(service.config).toBe(config);
    });

    it("should inherit from BaseService", () => {
      const service = new LoggingService();

      expect(service).toBeInstanceOf(require("../../../../../bootstrap/services/base-service.js"));
    });
  });

  describe("static defaults property", () => {
    it("should return the shared logging defaults from constants", () => {
      const defaults = LoggingService.defaults;
      
      expect(defaults).toBeDefined();
      expect(defaults).toHaveProperty('ciLogQueryParam');
      expect(defaults).toHaveProperty('clientLogEndpoint');
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties and mark as initialized", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      const initializedService = service.initialize();
      
      expect(initializedService).toBe(service);
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
      expect(service.isCommonJs).toBeDefined(); // Boolean value
      expect(service.ciLoggingEnabled).toBe(false);
    });

    it("should set up bound methods", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
      
      // Verify methods are bound to the service instance
      expect(service.setCiLoggingEnabled).not.toBe(LoggingService.prototype.setCiLoggingEnabled);
      expect(service.detectCiLogging).not.toBe(LoggingService.prototype.detectCiLogging);
    });

    it("should set up default configuration values", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.ciLogQueryParam).toBe("ci");
      expect(service.clientLogEndpoint).toBe("/__client-log");
    });

    it("should use config overrides for default values", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        ciLogQueryParam: "custom-ci",
        clientLogEndpoint: "/custom-log"
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.ciLogQueryParam).toBe("custom-ci");
      expect(service.clientLogEndpoint).toBe("/custom-log");
    });

    it("should register the service in the registry", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "logging",
        service,
        { folder: "services/cdn", domain: "cdn" },
        []
      );
    });

    it("should prevent double initialization", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(() => service.initialize()).toThrow();
    });
  });

  describe("setCiLoggingEnabled method", () => {
    it("should toggle the CI logging enabled flag", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      service.setCiLoggingEnabled(false);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });

    it("should coerce the value to boolean", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      service.setCiLoggingEnabled("truthy");
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      service.setCiLoggingEnabled(0);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("detectCiLogging method", () => {
    it("should return window.__RWTRA_CI_MODE__ value if available", () => {
      global.window.__RWTRA_CI_MODE__ = true;
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
      
      global.window.__RWTRA_CI_MODE__ = false;
      expect(service.detectCiLogging()).toBe(false);
    });

    it("should detect CI logging from query params", () => {
      global.window.location.search = "?ci=1";
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from query params with 'true' value", () => {
      global.window.location.search = "?ci=true";
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from query params with 'TRUE' (case insensitive)", () => {
      global.window.location.search = "?ci=TRUE";
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from localhost hostname", () => {
      global.window.location.hostname = "localhost";
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from 127.0.0.1 hostname", () => {
      global.window.location.hostname = "127.0.0.1";
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging()).toBe(true);
    });

    it("should detect CI logging from config override", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging({ ciLogging: true })).toBe(true);
      expect(service.detectCiLogging({ ciLogging: false })).toBe(false);
    });

    it("should return false when no conditions are met", () => {
      global.window.__RWTRA_CI_MODE__ = undefined;
      global.window.location.search = "?other=param";
      global.window.location.hostname = "example.com";
      
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      expect(service.detectCiLogging({})).toBe(false);
    });
  });

  describe("serializeForLog method", () => {
    it("should serialize Error objects properly", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      const error = new Error("Test error");
      const result = service.serializeForLog(error);
      
      expect(result).toHaveProperty('message', "Test error");
      expect(result).toHaveProperty('stack');
      expect(typeof result.stack).toBe('string');
    });

    it("should serialize regular objects", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      const obj = { name: "test", value: 42 };
      const result = service.serializeForLog(obj);
      
      expect(result).toEqual(obj);
    });

    it("should handle unserializable objects", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
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

    it("should return primitives as-is", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
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
    it("should return a promise that resolves after specified time", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      const start = Date.now();
      await service.wait(10);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(9); // Allow 1ms tolerance
    });

    it("should resolve immediately when passed 0", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      const start = Date.now();
      await service.wait(0);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(10); // Should be almost immediate
    });
  });

  describe("logClient method", () => {
    it("should send log data via sendBeacon when CI logging is enabled", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
    });

    it("should not send logs when CI logging is disabled and not an error level", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(false);
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
    });

    it("should send error level logs even when CI logging is disabled", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(false);
      
      service.logClient("test-error", { data: "value" }, "error");
      
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
    });

    it("should log error/warn to console even when CI logging is disabled", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      service.setCiLoggingEnabled(false);
      
      service.logClient("test-error", { data: "value" }, "error");
      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-error", { data: "value" });
      
      service.logClient("test-warn", { data: "value" }, "warn");
      expect(global.console.warn).toHaveBeenCalledWith("[bootstrap]", "test-warn", { data: "value" });
    });

    it("should use appropriate console method based on level", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
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
    it("should return the current CI logging enabled state", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      service.setCiLoggingEnabled(false);
      expect(service.isCiLoggingEnabled()).toBe(false);
    });
  });

  describe("integration", () => {
    it("should work through full lifecycle", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      
      expect(service).toBeInstanceOf(LoggingService);
      
      const initializedService = service.initialize();
      expect(initializedService).toBe(service);
      expect(initializedService.initialized).toBe(true);
      
      // Test functionality
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      const detected = service.detectCiLogging({ ciLogging: true });
      expect(detected).toBe(true);
      
      const serialized = service.serializeForLog({ test: "value" });
      expect(serialized).toEqual({ test: "value" });
    });

    it("should handle complete logging flow", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();
      
      // Enable logging
      service.setCiLoggingEnabled(true);
      
      // Test logging
      service.logClient("test-event", { data: "value" });
      expect(global.console.info).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "value" });
      
      // Test wait
      await service.wait(1);
    });
  });
});