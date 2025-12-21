// Simple test to check if we can create and initialize the service
const modulePath = '../../../../../bootstrap/services/cdn/logging-service.js';
const configPath = '../../../../../bootstrap/configs/cdn/logging-service.js';
const LoggingService = require(modulePath);
const LoggingServiceConfig = require(configPath);

describe("LoggingService comprehensive test", () => {
  let originalWindow;
  let originalConsole;
  let originalModule;
  let originalNavigator;

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

  it("should create and initialize the service", () => {
    const service = new LoggingService();
    const initializedService = service.initialize();

    expect(initializedService).toBe(service);
    expect(initializedService.initialized).toBe(true);
  });

  it("should toggle CI logging", () => {
    const service = new LoggingService();
    service.initialize();

    service.setCiLoggingEnabled(true);
    expect(service.isCiLoggingEnabled()).toBe(true);

    service.setCiLoggingEnabled(false);
    expect(service.isCiLoggingEnabled()).toBe(false);
  });
});