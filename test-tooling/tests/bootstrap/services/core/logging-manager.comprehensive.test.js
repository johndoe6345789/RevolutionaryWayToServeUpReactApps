// Comprehensive test suite for LoggingManager class
const LoggingManager = require("../../../../../bootstrap/services/core/logging-manager.js");

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
  mockFn.mockResolvedValue = (value) => {
    mockFn.returnValue = Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockRejectedValue = (error) => {
    mockFn.returnValue = Promise.reject(error);
    return mockFn;
  };
  return mockFn;
}

describe("LoggingManager", () => {
  let service;
  let mockConfig;
  let mockServiceRegistry;

  beforeEach(() => {
    mockServiceRegistry = {
      register: createMockFunction()
    };

    mockConfig = {
      logClient: createMockFunction(),
      serializeForLog: createMockFunction(),
      serviceRegistry: mockServiceRegistry
    };

    service = new LoggingManager(mockConfig);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      expect(service).toBeInstanceOf(LoggingManager);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new LoggingManager();
      expect(serviceWithDefault).toBeInstanceOf(LoggingManager);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.logClient).toBe(mockConfig.logClient);
      expect(service.serializeForLog).toBe(mockConfig.serializeForLog);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
    });

    test("should register the service in the service registry", () => {
      service.initialize();

      expect(mockServiceRegistry.register.calls.length).toBe(1);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("loggingManager");
      expect(mockServiceRegistry.register.calls[0][1]).toBe(service);
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/core",
        domain: "core"
      });
      expect(mockServiceRegistry.register.calls[0][3]).toEqual([]);
    });

    test("should throw if service registry is not provided", () => {
      const configWithoutServiceRegistry = {
        logClient: createMockFunction(),
        serializeForLog: createMockFunction()
      };
      const serviceWithoutRegistry = new LoggingManager(configWithoutServiceRegistry);

      expect(() => {
        serviceWithoutRegistry.initialize();
      }).toThrow("ServiceRegistry required for LoggingManager");
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });

    test("should return the service instance to allow chaining", () => {
      const result = service.initialize();

      expect(result).toBe(service);
    });
  });

  describe("install method", () => {
    let mockWindow;

    beforeEach(() => {
      mockWindow = {
        addEventListener: createMockFunction(),
        document: {}
      };
    });

    test("should return self when no window is available", () => {
      service.initialize();

      const result = service.install(undefined);

      expect(result).toBe(service);
    });

    test("should return self when window is undefined", () => {
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
    });

    test("should throw if not initialized before install", () => {
      expect(() => {
        service.install(mockWindow);
      }).toThrow();
    });

    test("should set up window logging when window is provided", () => {
      service.initialize();

      const result = service.install(mockWindow);

      expect(result).toBe(service);
      expect(mockWindow.__rwtraLog).toBe(mockConfig.logClient);
      expect(mockWindow.addEventListener.calls.length).toBe(2);
      expect(mockWindow.addEventListener.calls[0][0]).toBe("error");
      expect(mockWindow.addEventListener.calls[1][0]).toBe("unhandledrejection");
    });

    test("should register error event listener", () => {
      service.initialize();
      service.install(mockWindow);

      expect(mockWindow.addEventListener.calls[0][0]).toBe("error");
    });

    test("should register unhandled rejection listener", () => {
      service.initialize();
      service.install(mockWindow);

      expect(mockWindow.addEventListener.calls[1][0]).toBe("unhandledrejection");
    });

    test("should return self even when window is not provided", () => {
      service.initialize();

      const result = service.install(null);

      expect(result).toBe(service);
    });
  });

  describe("_handleWindowError method", () => {
    test("should call logClient with error details", () => {
      const mockLogClient = createMockFunction();
      mockConfig.logClient = mockLogClient;
      service = new LoggingManager(mockConfig);
      service.initialize();

      const mockEvent = {
        message: "Test error",
        filename: "test.js",
        lineno: 10,
        colno: 5
      };

      service._handleWindowError(mockEvent);

      expect(mockLogClient.calls.length).toBe(1);
      expect(mockLogClient.calls[0][0]).toBe("window:error");
      expect(mockLogClient.calls[0][1]).toEqual({
        message: "Test error",
        filename: "test.js",
        lineno: 10,
        colno: 5
      });
    });

    test("should handle error event with missing properties", () => {
      const mockLogClient = createMockFunction();
      mockConfig.logClient = mockLogClient;
      service = new LoggingManager(mockConfig);
      service.initialize();

      const mockEvent = {}; // Event with no properties

      service._handleWindowError(mockEvent);

      expect(mockLogClient.calls.length).toBe(1);
      expect(mockLogClient.calls[0][0]).toBe("window:error");
      expect(mockLogClient.calls[0][1]).toEqual({
        message: undefined,
        filename: undefined,
        lineno: undefined,
        colno: undefined
      });
    });
  });

  describe("_handleUnhandledRejection method", () => {
    test("should call logClient with rejection reason", () => {
      const mockLogClient = createMockFunction();
      const mockSerializeForLog = createMockFunction().mockReturnValue({ message: "serialized error" });
      mockConfig.logClient = mockLogClient;
      mockConfig.serializeForLog = mockSerializeForLog;
      service = new LoggingManager(mockConfig);
      service.initialize();

      const mockReason = new Error("Test rejection");
      const mockEvent = { reason: mockReason };

      service._handleUnhandledRejection(mockEvent);

      expect(mockLogClient.calls.length).toBe(1);
      expect(mockLogClient.calls[0][0]).toBe("window:unhandledrejection");
      expect(mockLogClient.calls[0][1]).toEqual({
        reason: { message: "serialized error" }
      });
      expect(mockSerializeForLog.calls.length).toBeGreaterThan(0);
      expect(mockSerializeForLog.calls[0][0]).toBe(mockReason);
    });

    test("should handle rejection event without reason property", () => {
      const mockLogClient = createMockFunction();
      const mockSerializeForLog = createMockFunction().mockReturnValue("unknown");
      mockConfig.logClient = mockLogClient;
      mockConfig.serializeForLog = mockSerializeForLog;
      service = new LoggingManager(mockConfig);
      service.initialize();

      const mockEvent = {}; // Event with no reason property

      service._handleUnhandledRejection(mockEvent);

      expect(mockLogClient.calls.length).toBe(1);
      expect(mockLogClient.calls[0][0]).toBe("window:unhandledrejection");
      expect(mockLogClient.calls[0][1]).toEqual({
        reason: "unknown"
      });
      expect(mockSerializeForLog.calls.length).toBeGreaterThan(0);
      expect(mockSerializeForLog.calls[0][0]).toBe("unknown");
    });

    test("should handle rejection event with null reason", () => {
      const mockLogClient = createMockFunction();
      const mockSerializeForLog = createMockFunction().mockReturnValue("unknown");
      mockConfig.logClient = mockLogClient;
      mockConfig.serializeForLog = mockSerializeForLog;
      service = new LoggingManager(mockConfig);
      service.initialize();

      const mockEvent = { reason: null };

      service._handleUnhandledRejection(mockEvent);

      expect(mockLogClient.calls.length).toBe(1);
      expect(mockLogClient.calls[0][0]).toBe("window:unhandledrejection");
      expect(mockLogClient.calls[0][1]).toEqual({
        reason: "unknown"
      });
      expect(mockSerializeForLog.calls.length).toBeGreaterThan(0);
      expect(mockSerializeForLog.calls[0][0]).toBe("unknown");
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", () => {
      // Initialize the service
      service.initialize();

      // Verify it's initialized
      expect(service.initialized).toBe(true);

      // Mock window for install
      const mockWindow = {
        addEventListener: createMockFunction(),
        document: {}
      };

      // Install the service
      const result = service.install(mockWindow);

      // Verify install returned the service
      expect(result).toBe(service);

      // Verify window was set up correctly
      expect(mockWindow.__rwtraLog).toBe(mockConfig.logClient);
      expect(mockWindow.addEventListener.calls.length).toBe(2);

      // Test _handleWindowError
      const mockEvent = {
        message: "Integration test error",
        filename: "integration.js",
        lineno: 100,
        colno: 20
      };
      service._handleWindowError(mockEvent);
      expect(mockConfig.logClient.calls.length).toBe(1);

      // Test _handleUnhandledRejection
      const mockRejectionEvent = { reason: "Integration rejection" };
      service._handleUnhandledRejection(mockRejectionEvent);
      expect(mockConfig.logClient.calls.length).toBe(2);
    });

    test("should handle complete install and error flow", () => {
      service.initialize();

      const mockWindow = {
        addEventListener: createMockFunction(),
        document: {}
      };

      // Install
      service.install(mockWindow);

      // Simulate an error event
      const errorEvent = {
        message: "Simulated error",
        filename: "simulated.js",
        lineno: 50,
        colno: 10
      };
      service._handleWindowError(errorEvent);

      // Verify the error was logged
      expect(mockConfig.logClient.calls.length).toBe(1);
      expect(mockConfig.logClient.calls[0][0]).toBe("window:error");

      // Simulate an unhandled rejection event
      const rejectionEvent = { reason: new Error("Simulated rejection") };
      service._handleUnhandledRejection(rejectionEvent);

      // Verify the rejection was logged
      expect(mockConfig.logClient.calls.length).toBe(2);
      expect(mockConfig.logClient.calls[1][0]).toBe("window:unhandledrejection");
    });
  });
});