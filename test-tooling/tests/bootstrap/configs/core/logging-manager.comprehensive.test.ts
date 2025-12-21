const LoggingManagerConfig = require("../../../../bootstrap/configs/core/logging-manager.js");

describe("LoggingManagerConfig", () => {
  describe("constructor", () => {
    it("should initialize with all provided configuration options", () => {
      const mockLogClient = jest.fn();
      const mockSerializeForLog = jest.fn();
      const mockServiceRegistry = { register: jest.fn() };
      
      const config = new LoggingManagerConfig({
        logClient: mockLogClient,
        serializeForLog: mockSerializeForLog,
        serviceRegistry: mockServiceRegistry
      });

      expect(config.logClient).toBe(mockLogClient);
      expect(config.serializeForLog).toBe(mockSerializeForLog);
      expect(config.serviceRegistry).toBe(mockServiceRegistry);
    });

    it("should initialize with undefined values when no options provided", () => {
      const config = new LoggingManagerConfig();

      expect(config.logClient).toBeUndefined();
      expect(config.serializeForLog).toBeUndefined();
      expect(config.serviceRegistry).toBeUndefined();
    });

    it("should accept partial configuration options", () => {
      const config = new LoggingManagerConfig({
        logClient: jest.fn()
      });

      expect(config.logClient).toBeDefined();
      expect(config.serializeForLog).toBeUndefined();
      expect(config.serviceRegistry).toBeUndefined();
    });

    it("should handle null values in configuration", () => {
      const config = new LoggingManagerConfig({
        logClient: null,
        serializeForLog: null,
        serviceRegistry: null
      });

      expect(config.logClient).toBeNull();
      expect(config.serializeForLog).toBeNull();
      expect(config.serviceRegistry).toBeNull();
    });

    it("should accept function values for logClient", () => {
      const logClientFn = (msg, data) => console.log(msg, data);
      
      const config = new LoggingManagerConfig({
        logClient: logClientFn
      });

      expect(config.logClient).toBe(logClientFn);
    });

    it("should accept function values for serializeForLog", () => {
      const serializeFn = (obj) => JSON.stringify(obj);
      
      const config = new LoggingManagerConfig({
        serializeForLog: serializeFn
      });

      expect(config.serializeForLog).toBe(serializeFn);
    });

    it("should accept object values for serviceRegistry", () => {
      const mockServiceRegistry = { 
        register: jest.fn(),
        getService: jest.fn()
      };
      
      const config = new LoggingManagerConfig({
        serviceRegistry: mockServiceRegistry
      });

      expect(config.serviceRegistry).toBe(mockServiceRegistry);
    });
  });

  describe("property validation", () => {
    it("should maintain reference equality for objects", () => {
      const mockServiceRegistry = { test: "value" };
      const mockSerializeForLog = jest.fn();
      
      const config = new LoggingManagerConfig({
        serviceRegistry: mockServiceRegistry,
        serializeForLog: mockSerializeForLog
      });

      expect(config.serviceRegistry).toBe(mockServiceRegistry);
      expect(config.serializeForLog).toBe(mockSerializeForLog);
    });

    it("should store function references correctly", () => {
      const logClient = jest.fn();
      const serializeForLog = (data) => data;
      
      const config = new LoggingManagerConfig({
        logClient: logClient,
        serializeForLog: serializeForLog
      });

      expect(config.logClient).toBe(logClient);
      expect(config.serializeForLog).toBe(serializeForLog);
    });
  });

  describe("edge cases", () => {
    it("should handle empty object configuration", () => {
      const config = new LoggingManagerConfig({});

      expect(config.logClient).toBeUndefined();
      expect(config.serializeForLog).toBeUndefined();
      expect(config.serviceRegistry).toBeUndefined();
    });

    it("should handle configuration with unknown properties", () => {
      const config = new LoggingManagerConfig({
        logClient: jest.fn(),
        unknownProp: "value",
        anotherUnknown: "value2"
      });

      expect(config.logClient).toBeDefined();
      expect(config.serializeForLog).toBeUndefined();
      expect(config.serviceRegistry).toBeUndefined();
      // The unknown properties should not be present
      expect(config.unknownProp).toBeUndefined();
      expect(config.anotherUnknown).toBeUndefined();
    });

    it("should handle primitive values for functions", () => {
      const config = new LoggingManagerConfig({
        logClient: "notAFunction",
        serializeForLog: 42
      });

      expect(config.logClient).toBe("notAFunction");
      expect(config.serializeForLog).toBe(42);
      expect(config.serviceRegistry).toBeUndefined();
    });
  });

  describe("integration tests", () => {
    it("should work with realistic logging manager configuration", () => {
      const realisticConfig = new LoggingManagerConfig({
        logClient: (msg, data) => fetch('/log', {
          method: 'POST',
          body: JSON.stringify({ msg, data, timestamp: Date.now() })
        }),
        serializeForLog: (obj) => {
          try {
            return JSON.stringify(obj);
          } catch (e) {
            return String(obj);
          }
        },
        serviceRegistry: {
          register: jest.fn(),
          getService: jest.fn(),
          listServices: jest.fn()
        }
      });

      expect(realisticConfig.logClient).toBeDefined();
      expect(realisticConfig.serializeForLog).toBeDefined();
      expect(realisticConfig.serviceRegistry).toBeDefined();
      expect(typeof realisticConfig.logClient).toBe('function');
      expect(typeof realisticConfig.serializeForLog).toBe('function');
      expect(typeof realisticConfig.serviceRegistry.register).toBe('function');
    });
  });
});