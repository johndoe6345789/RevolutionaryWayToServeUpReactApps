const BaseService = require("../../../../bootstrap/services/base-service.js");

// Create a concrete implementation for testing since BaseService is abstract
class TestService extends BaseService {
  initialize() {
    this._markInitialized();
    return this;
  }
}

describe("BaseService", () => {
  describe("constructor", () => {
    it("should store the provided configuration object", () => {
      const config = { test: "value", option: true };
      const service = new TestService(config);
      
      expect(service.config).toBe(config);
    });

    it("should initialize with an empty object when no config is provided", () => {
      const service = new TestService();
      
      expect(service.config).toEqual({});
    });

    it("should initialize with an empty object when undefined config is provided", () => {
      const service = new TestService(undefined);
      
      expect(service.config).toEqual({});
    });

    it("should track initialization state as false by default", () => {
      const service = new TestService({});
      
      expect(service.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly on the base implementation", () => {
      const baseService = new BaseService({});
      
      expect(() => baseService.initialize()).toThrow(`${BaseService.name} must implement initialize()`);
    });

    it("should not throw when called on concrete implementation", () => {
      const service = new TestService({});
      
      expect(() => service.initialize()).not.toThrow();
    });

    it("should mark the service as initialized after initialize is called", () => {
      const service = new TestService({});
      
      service.initialize();
      
      expect(service.initialized).toBe(true);
    });

    it("should return the service instance to allow chaining", () => {
      const service = new TestService({});
      
      const result = service.initialize();
      
      expect(result).toBe(service);
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when service is not initialized", () => {
      const service = new TestService({});
      
      expect(() => service._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when service is already initialized", () => {
      const service = new TestService({});
      service.initialize();
      
      expect(() => service._ensureNotInitialized()).toThrow(`${TestService.name} already initialized`);
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized flag to true", () => {
      const service = new TestService();
      
      service._markInitialized();
      
      expect(service.initialized).toBe(true);
    });

    it("should be callable multiple times", () => {
      const service = new TestService();
      
      service._markInitialized();
      service._markInitialized(); // Should not throw
      
      expect(service.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when service is not initialized", () => {
      const service = new TestService({});
      
      expect(() => service._ensureInitialized()).toThrow(`${TestService.name} not initialized`);
    });

    it("should not throw when service is initialized", () => {
      const service = new TestService({});
      service.initialize();
      
      expect(() => service._ensureInitialized()).not.toThrow();
    });
  });

  describe("_requireServiceRegistry method", () => {
    it("should return the configured ServiceRegistry when available", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { serviceRegistry: mockRegistry };
      const service = new TestService(config);
      
      const result = service._requireServiceRegistry();
      
      expect(result).toBe(mockRegistry);
    });

    it("should throw an error when ServiceRegistry is missing from config", () => {
      const service = new TestService({});
      
      expect(() => service._requireServiceRegistry()).toThrow(`ServiceRegistry required for ${TestService.name}`);
    });

    it("should throw with the correct service class name", () => {
      class CustomService extends BaseService {
        initialize() {
          this._markInitialized();
        }
      }
      
      const service = new CustomService({});
      
      expect(() => service._requireServiceRegistry()).toThrow("ServiceRegistry required for CustomService");
    });
  });

  describe("_resolveNamespace method", () => {
    it("should return the configured namespace when available", () => {
      const mockNamespace = { helpers: {} };
      const config = { namespace: mockNamespace };
      const service = new TestService(config);
      
      const result = service._resolveNamespace();
      
      expect(result).toBe(mockNamespace);
    });

    it("should throw an error when namespace is missing from config", () => {
      const service = new TestService({});
      
      expect(() => service._resolveNamespace()).toThrow(`Namespace required for ${TestService.name}`);
    });

    it("should throw with the correct service class name", () => {
      class CustomService extends BaseService {
        initialize() {
          this._markInitialized();
        }
      }
      
      const service = new CustomService({});
      
      expect(() => service._resolveNamespace()).toThrow("Namespace required for CustomService");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle of initialization and checks", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      const config = { 
        serviceRegistry: mockRegistry,
        namespace: mockNamespace 
      };
      const service = new TestService(config);
      
      // Initially not initialized
      expect(service.initialized).toBe(false);
      expect(() => service._ensureInitialized()).toThrow();
      expect(() => service._ensureNotInitialized()).not.toThrow();
      
      // After initialization
      service.initialize();
      expect(service.initialized).toBe(true);
      expect(() => service._ensureInitialized()).not.toThrow();
      expect(() => service._ensureNotInitialized()).toThrow();
      
      // Verify registry and namespace can be retrieved
      expect(service._requireServiceRegistry()).toBe(mockRegistry);
      expect(service._resolveNamespace()).toBe(mockNamespace);
    });

    it("should handle multiple operations in sequence", () => {
      const mockRegistry = { 
        register: jest.fn(),
        getService: jest.fn(),
        getMetadata: jest.fn()
      };
      const config = { serviceRegistry: mockRegistry };
      const service = new TestService(config);
      
      // Verify pre-initialization state
      expect(service.initialized).toBe(false);
      expect(service._requireServiceRegistry()).toBe(mockRegistry);
      
      // Initialize
      const result = service.initialize();
      
      // Verify post-initialization state
      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      
      // Verify initialization guards work correctly
      expect(() => service._ensureInitialized()).not.toThrow();
      expect(() => service._ensureNotInitialized()).toThrow();
    });
  });

  describe("error handling", () => {
    it("should throw appropriate errors with service-specific names", () => {
      class ErrorTestService extends BaseService {
        initialize() {
          this._markInitialized();
        }
      }
      
      const service = new ErrorTestService({});
      
      // Test that error messages contain the correct class name
      expect(() => service._requireServiceRegistry()).toThrow("ServiceRegistry required for ErrorTestService");
      expect(() => service._resolveNamespace()).toThrow("Namespace required for ErrorTestService");
      
      // Initialize the service to test other error conditions
      service.initialize();
      
      expect(() => service._ensureNotInitialized()).toThrow("ErrorTestService already initialized");
    });
  });
});