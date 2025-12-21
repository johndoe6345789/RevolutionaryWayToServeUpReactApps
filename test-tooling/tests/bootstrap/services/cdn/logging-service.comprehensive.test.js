const modulePath = '../../../../../bootstrap/services/cdn/logging-service.js';
const configPath = '../../../../../bootstrap/configs/cdn/logging-service.js';
const LoggingService = require(modulePath);
const LoggingServiceConfig = require(configPath);

describe("LoggingService", () => {
  let originalWindow;
  let originalNavigator;
  let originalConsole;
  let originalModule;

  beforeEach(() => {
    // Store original objects
    originalWindow = global.window;
    originalNavigator = global.navigator;
    originalConsole = global.console;
    originalModule = global.module;
    
    // Setup mock window
    global.window = {
      location: {
        search: "",
        hostname: "localhost",
        href: "http://localhost"
      },
      __RWTRA_CI_MODE__: undefined
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
    
    // Setup module environment
    global.module = { exports: {} };
  });

  afterEach(() => {
    // Restore original objects
    global.window = originalWindow;
    global.navigator = originalNavigator;
    global.console = originalConsole;
    global.module = originalModule;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance with default config", () => {
      const service = new LoggingService();
      
      expect(service).toBeInstanceOf(LoggingService);
      expect(service.config).toBeInstanceOf(LoggingServiceConfig);
    });

    it("should create an instance with provided config", () => {
      const config = new LoggingServiceConfig({ ciLogging: true });
      const service = new LoggingService(config);
      
      expect(service.config).toBe(config);
    });
  });

  describe("static defaults property", () => {
    it("should return the shared logging defaults", () => {
      const defaults = LoggingService.defaults;
      
      // Should return the common constants module
      expect(defaults).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up bindings and configuration fallbacks", () => {
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
      expect(typeof service.setCiLoggingEnabled).toBe("function");
      expect(typeof service.detectCiLogging).toBe("function");
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.wait).toBe("function");
      expect(typeof service.serializeForLog).toBe("function");
      expect(typeof service.isCiLoggingEnabled).toBe("function");
      expect(service.ciLogQueryParam).toBe("ci");
      expect(service.clientLogEndpoint).toBe("/__client-log");
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
      
      expect(mockServiceRegistry.register).toHaveBeenCalledWith("logging", service, {
        folder: "services/cdn",
        domain: "cdn",
      });
    });

    it("should throw if initialized twice", () => {
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
        ciLogQueryParam: "ci",
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
        ciLogQueryParam: "ci",
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
      global.window.location.search = "?other=param";
      global.window.location.hostname = "example.com";
      global.window.__RWTRA_CI_MODE__ = undefined;

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
      const error = new Error("test error");
      const mockServiceRegistry = {
        register: jest.fn()
      };

      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();

      const serialized = service.serializeForLog(error);

      expect(serialized).toEqual({
        message: "test error",
        stack: error.stack
      });
    });

    it("should serialize regular objects", () => {
      const obj = { a: 1, b: "test", c: [1, 2, 3] };
      const mockServiceRegistry = {
        register: jest.fn()
      };

      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();

      const serialized = service.serializeForLog(obj);

      expect(serialized).toEqual(obj);
    });

    it("should handle unserializable objects", () => {
      const circularObj = { a: 1 };
      circularObj.ref = circularObj; // Create circular reference
      const mockServiceRegistry = {
        register: jest.fn()
      };

      const config = new LoggingServiceConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      const service = new LoggingService(config);
      service.initialize();

      const serialized = service.serializeForLog(circularObj);

      expect(serialized).toEqual({
        type: "object",
        note: "unserializable"
      });
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
      expect(service.serializeForLog(123)).toBe(123);
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

      // The wait time should be at least 10ms
      expect(end - start).toBeGreaterThanOrEqual(9); // Allow for small timing variations
    });
  });

  describe("logClient method", () => {
    it("should send log data via sendBeacon when CI logging is enabled", async () => {
      const service = new LoggingService();
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      const mockBlob = jest.fn();
      global.Blob = mockBlob;
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
      expect(global.Blob).toHaveBeenCalled();
    });

    it("should not send logs when CI logging is disabled and not an error level", () => {
      const service = new LoggingService();
      service.initialize();
      service.setCiLoggingEnabled(false);
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.navigator.sendBeacon).not.toHaveBeenCalled();
    });

    it("should send error level logs even when CI logging is disabled", () => {
      const service = new LoggingService();
      service.initialize();
      service.setCiLoggingEnabled(false);
      
      const mockBlob = jest.fn();
      global.Blob = mockBlob;
      
      service.logClient("test-event", { data: "value" }, "error");
      
      expect(global.navigator.sendBeacon).toHaveBeenCalled();
      expect(global.Blob).toHaveBeenCalled();
    });

    it("should log to console", () => {
      const service = new LoggingService();
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("test-event", { data: "value" });
      
      expect(global.console.info).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "value" });
    });

    it("should use appropriate console method based on level", () => {
      const service = new LoggingService();
      service.initialize();
      service.setCiLoggingEnabled(true);
      
      service.logClient("test-event", { data: "value" }, "error");
      expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "value" });
      
      service.logClient("test-event", { data: "value" }, "warn");
      expect(global.console.warn).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "value" });
    });
  });

  describe("isCiLoggingEnabled method", () => {
    it("should return the current CI logging enabled state", () => {
      const service = new LoggingService();
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
      
      // Test a few methods work correctly
      service.setCiLoggingEnabled(true);
      expect(service.isCiLoggingEnabled()).toBe(true);
      
      const detected = service.detectCiLogging({ ciLogging: true });
      expect(detected).toBe(true);
    });
  });
});