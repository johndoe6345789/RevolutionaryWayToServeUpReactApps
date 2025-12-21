import BaseService from "../../../../bootstrap/services/base-service.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.services = new Map();
  }
  
  register(name, service, metadata) {
    this.services.set(name, { service, metadata });
  }
  
  getService(name) {
    const entry = this.services.get(name);
    return entry ? entry.service : null;
  }
}

describe("BaseService", () => {
  describe("constructor", () => {
    it("should initialize with default empty config", () => {
      const service = new BaseService();
      
      expect(service.config).toEqual({});
      expect(service.initialized).toBe(false);
    });

    it("should accept and store configuration", () => {
      const config = { test: "value", other: "data" };
      const service = new BaseService(config);
      
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });

    it("should set initialized to false by default", () => {
      const service = new BaseService();
      
      expect(service.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly", () => {
      const service = new BaseService();
      
      expect(() => service.initialize()).toThrow(
        "BaseService must implement initialize()"
      );
    });

    it("should be overridable by subclasses", () => {
      class TestService extends BaseService {
        initialize() {
          this._markInitialized();
          return "initialized";
        }
      }
      
      const service = new TestService();
      const result = service.initialize();
      
      expect(result).toBe("initialized");
      expect(service.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when service is not initialized", () => {
      const service = new BaseService();
      
      expect(() => service._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when service is already initialized", () => {
      const service = new BaseService();
      service._markInitialized();
      
      expect(() => service._ensureNotInitialized()).toThrow(
        "BaseService already initialized"
      );
    });

    it("should work correctly after marking as initialized", () => {
      const service = new BaseService();
      
      // Should not throw initially
      expect(() => service._ensureNotInitialized()).not.toThrow();
      
      // Mark as initialized
      service._markInitialized();
      
      // Should throw after initialization
      expect(() => service._ensureNotInitialized()).toThrow(
        "BaseService already initialized"
      );
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized property to true", () => {
      const service = new BaseService();
      
      expect(service.initialized).toBe(false);
      service._markInitialized();
      expect(service.initialized).toBe(true);
    });

    it("should be called to mark service as initialized", () => {
      class TestService extends BaseService {
        initialize() {
          this._markInitialized();
        }
      }
      
      const service = new TestService();
      expect(service.initialized).toBe(false);
      
      service.initialize();
      expect(service.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when service is not initialized", () => {
      const service = new BaseService();
      
      expect(() => service._ensureInitialized()).toThrow(
        "BaseService not initialized"
      );
    });

    it("should not throw when service is initialized", () => {
      const service = new BaseService();
      service._markInitialized();
      
      expect(() => service._ensureInitialized()).not.toThrow();
    });

    it("should work correctly after initialization", () => {
      class TestService extends BaseService {
        initialize() {
          this._markInitialized();
        }
      }
      
      const service = new TestService();
      
      // Should throw before initialization
      expect(() => service._ensureInitialized()).toThrow();
      
      // Initialize the service
      service.initialize();
      
      // Should not throw after initialization
      expect(() => service._ensureInitialized()).not.toThrow();
    });
  });

  describe("_requireServiceRegistry method", () => {
    it("should return the service registry from config", () => {
      const mockRegistry = new MockServiceRegistry();
      const config = { serviceRegistry: mockRegistry };
      const service = new BaseService(config);
      
      const registry = service._requireServiceRegistry();
      
      expect(registry).toBe(mockRegistry);
    });

    it("should throw an error when no service registry is provided", () => {
      const service = new BaseService({});
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for BaseService"
      );
    });

    it("should throw an error when serviceRegistry is null", () => {
      const config = { serviceRegistry: null };
      const service = new BaseService(config);
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for BaseService"
      );
    });

    it("should throw an error when serviceRegistry is undefined", () => {
      const config = { serviceRegistry: undefined };
      const service = new BaseService(config);
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for BaseService"
      );
    });
  });

  describe("_resolveNamespace method", () => {
    it("should return the namespace from config", () => {
      const mockNamespace = { helpers: {} };
      const config = { namespace: mockNamespace };
      const service = new BaseService(config);
      
      const namespace = service._resolveNamespace();
      
      expect(namespace).toBe(mockNamespace);
    });

    it("should throw an error when no namespace is provided", () => {
      const service = new BaseService({});
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });

    it("should throw an error when namespace is null", () => {
      const config = { namespace: null };
      const service = new BaseService(config);
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });

    it("should throw an error when namespace is undefined", () => {
      const config = { namespace: undefined };
      const service = new BaseService(config);
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with proper configuration", () => {
      const mockRegistry = new MockServiceRegistry();
      const mockNamespace = { helpers: {} };
      const config = { 
        serviceRegistry: mockRegistry, 
        namespace: mockNamespace,
        custom: "value" 
      };
      
      class TestService extends BaseService {
        initialize() {
          // Verify registry and namespace are accessible
          const registry = this._requireServiceRegistry();
          const namespace = this._resolveNamespace();
          
          expect(registry).toBe(mockRegistry);
          expect(namespace).toBe(mockNamespace);
          
          this._markInitialized();
        }
      }
      
      const service = new TestService(config);
      
      // Before initialization
      expect(service.initialized).toBe(false);
      expect(() => service._ensureInitialized()).toThrow();
      
      // Initialize
      service.initialize();
      
      // After initialization
      expect(service.initialized).toBe(true);
      expect(() => service._ensureInitialized()).not.toThrow();
      expect(() => service._ensureNotInitialized()).toThrow(); // Should throw now
    });

    it("should enforce proper initialization lifecycle", () => {
      class TestService extends BaseService {
        initialize() {
          this._ensureNotInitialized(); // Should not throw
          this._markInitialized();
          // Attempting to initialize again would be after marking initialized
        }
      }
      
      const service = new TestService();
      
      // Verify not initialized initially
      expect(service.initialized).toBe(false);
      expect(() => service._ensureInitialized()).toThrow();
      expect(() => service._ensureNotInitialized()).not.toThrow();
      
      // Initialize once
      service.initialize();
      
      // Verify initialized
      expect(service.initialized).toBe(true);
      expect(() => service._ensureInitialized()).not.toThrow();
    });

    it("should handle complex configuration scenarios", () => {
      const mockRegistry = new MockServiceRegistry();
      const mockNamespace = { helpers: { existing: "helper" } };
      const config = { 
        serviceRegistry: mockRegistry, 
        namespace: mockNamespace,
        additional: { settings: "value" }
      };
      
      class ComplexTestService extends BaseService {
        initialize() {
          // Access various config properties
          const registry = this._requireServiceRegistry();
          const namespace = this._resolveNamespace();
          
          // Verify they match expected values
          expect(registry).toBe(mockRegistry);
          expect(namespace).toBe(mockNamespace);
          expect(this.config.additional.settings).toBe("value");
          
          this._markInitialized();
        }
      }
      
      const service = new ComplexTestService(config);
      service.initialize();
      
      // Verify everything worked
      expect(service.initialized).toBe(true);
      expect(service.config.additional.settings).toBe("value");
    });
  });
});