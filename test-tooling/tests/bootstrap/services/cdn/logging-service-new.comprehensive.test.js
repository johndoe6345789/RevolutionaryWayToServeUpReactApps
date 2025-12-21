const LoggingService = require("../../../../../bootstrap/services/cdn/logging-service.js");
const LoggingServiceConfig = require("../../../../../bootstrap/configs/cdn/logging-service.js");

describe("LoggingService comprehensive test", () => {
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
      document: {},
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
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.navigator = originalNavigator;
    global.console = originalConsole;
    jest.clearAllMocks();
  });

  test("should create and initialize the service", () => {
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
    expect(service.initialized).toBe(true);
  });

  test("should have proper method signatures", () => {
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
    expect(typeof service.serializeForLog).toBe("function");
    expect(typeof service.wait).toBe("function");
    expect(typeof service.logClient).toBe("function");
    expect(typeof service.isCiLoggingEnabled).toBe("function");
  });

  test("should handle CI logging enable/disable", () => {
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

  test("should detect CI logging from various sources", () => {
    // Change hostname to avoid localhost detection
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

    // Test with config override
    expect(service.detectCiLogging({ ciLogging: true })).toBe(true);
    expect(service.detectCiLogging({ ciLogging: false })).toBe(false);
  });

  test("should serialize different value types", () => {
    const mockServiceRegistry = {
      register: jest.fn()
    };
    
    const config = new LoggingServiceConfig({
      namespace: { helpers: {} },
      serviceRegistry: mockServiceRegistry
    });
    const service = new LoggingService(config);
    service.initialize();

    // Test primitive serialization
    expect(service.serializeForLog("string")).toBe("string");
    expect(service.serializeForLog(42)).toBe(42);
    expect(service.serializeForLog(true)).toBe(true);

    // Test object serialization
    const obj = { test: "value" };
    expect(service.serializeForLog(obj)).toEqual(obj);

    // Test error serialization
    const error = new Error("test error");
    const serializedError = service.serializeForLog(error);
    expect(serializedError).toHaveProperty("message", "test error");
    expect(serializedError).toHaveProperty("stack");
  });

  test("should handle wait functionality", async () => {
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
    await service.wait(10);  // Wait for 10ms
    const end = Date.now();
    
    // The wait should take at least 10ms
    expect(end - start).toBeGreaterThanOrEqual(8);  // Allow for small timing variations
  });

  test("should log to console appropriately", () => {
    const mockServiceRegistry = {
      register: jest.fn()
    };
    
    const config = new LoggingServiceConfig({
      namespace: { helpers: {} },
      serviceRegistry: mockServiceRegistry
    });
    const service = new LoggingService(config);
    service.initialize();
    service.setCiLoggingEnabled(true);  // Enable logging

    service.logClient("test-event", { data: "value" }, "info");
    expect(global.console.info).toHaveBeenCalledWith("[bootstrap]", "test-event", { data: "value" });

    service.logClient("test-error", { data: "value" }, "error");
    expect(global.console.error).toHaveBeenCalledWith("[bootstrap]", "test-error", { data: "value" });

    service.logClient("test-warn", { data: "value" }, "warn");
    expect(global.console.warn).toHaveBeenCalledWith("[bootstrap]", "test-warn", { data: "value" });
  });
});