import BaseService from "../../../../bootstrap/services/base-service.js";

describe("BaseService", () => {
  describe("constructor", () => {
    it("should initialize with empty config when no config provided", () => {
      const service = new BaseService();
      expect(service.config).toEqual({});
      expect(service.initialized).toBe(false);
    });

    it("should initialize with provided config", () => {
      const config = { test: "value", option: true };
      const service = new BaseService(config);
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });

    it("should initialize with empty object when null config provided", () => {
      const service = new BaseService(null);
      expect(service.config).toEqual({});
      expect(service.initialized).toBe(false);
    });

    it("should initialize with empty object when undefined config provided", () => {
      const service = new BaseService(undefined);
      expect(service.config).toEqual({});
      expect(service.initialized).toBe(false);
    });

    it("should initialize with complex config object", () => {
      const complexConfig = {
        namespace: { helpers: {} },
        serviceRegistry: { register: () => {} },
        nested: { value: "test" },
        array: [1, 2, 3],
        func: () => "test"
      };
      const service = new BaseService(complexConfig);
      expect(service.config).toBe(complexConfig);
      expect(service.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw error when called on base class directly", () => {
      const service = new BaseService();
      
      expect(() => service.initialize()).toThrow(
        "BaseService must implement initialize()"
      );
    });

    it("should throw error with correct class name", () => {
      class CustomService extends BaseService {}
      const service = new CustomService();
      
      expect(() => service.initialize()).toThrow(
        "CustomService must implement initialize()"
      );
    });

    it("should not throw when implemented in subclass", () => {
      class ImplementedService extends BaseService {
        initialize() {
          this._markInitialized();
          return "initialized";
        }
      }
      const service = new ImplementedService();
      
      expect(() => service.initialize()).not.toThrow();
      expect(service.initialize()).toBe("initialized");
      expect(service.initialized).toBe(true);
    });

    it("should maintain initialized state after implementation", () => {
      class ImplementedService extends BaseService {
        initialize() {
          this._markInitialized();
          return this;
        }
      }
      const service = new ImplementedService();
      service.initialize();
      
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

    it("should throw with correct class name", () => {
      class TestService extends BaseService {}
      const service = new TestService();
      service._markInitialized();
      
      expect(() => service._ensureNotInitialized()).toThrow(
        "TestService already initialized"
      );
    });

    it("should work correctly after initialization sequence", () => {
      class TestService extends BaseService {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          return this;
        }
      }
      const service = new TestService();
      
      // Should not throw before initialization
      expect(() => service._ensureNotInitialized()).not.toThrow();
      
      service.initialize();
      
      // Should throw after initialization
      expect(() => service._ensureNotInitialized()).toThrow();
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized property to true", () => {
      const service = new BaseService();
      expect(service.initialized).toBe(false);
      
      service._markInitialized();
      
      expect(service.initialized).toBe(true);
    });

    it("should be callable multiple times (no protection against multiple calls)", () => {
      const service = new BaseService();
      
      service._markInitialized();
      expect(service.initialized).toBe(true);
      
      service._markInitialized();
      expect(service.initialized).toBe(true);
    });

    it("should work with subclasses", () => {
      class TestService extends BaseService {}
      const service = new TestService();
      
      expect(service.initialized).toBe(false);
      service._markInitialized();
      expect(service.initialized).toBe(true);
    });

    it("should not affect other service instances", () => {
      const service1 = new BaseService();
      const service2 = new BaseService();
      
      expect(service1.initialized).toBe(false);
      expect(service2.initialized).toBe(false);
      
      service1._markInitialized();
      
      expect(service1.initialized).toBe(true);
      expect(service2.initialized).toBe(false);
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

    it("should throw with correct class name", () => {
      class TestService extends BaseService {}
      const service = new TestService();
      
      expect(() => service._ensureInitialized()).toThrow(
        "TestService not initialized"
      );
    });

    it("should work correctly after initialization", () => {
      class TestService extends BaseService {
        initialize() {
          this._markInitialized();
          return this;
        }
      }
      const service = new TestService();
      
      // Should throw before initialization
      expect(() => service._ensureInitialized()).toThrow();
      
      service.initialize();
      
      // Should not throw after initialization
      expect(() => service._ensureInitialized()).not.toThrow();
    });
  });

  describe("_requireServiceRegistry method", () => {
    it("should return service registry when available in config", () => {
      const mockRegistry = { register: jest.fn() };
      const service = new BaseService({ serviceRegistry: mockRegistry });
      
      const result = service._requireServiceRegistry();
      
      expect(result).toBe(mockRegistry);
    });

    it("should throw error when no service registry provided in config", () => {
      const service = new BaseService({});
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for BaseService"
      );
    });

    it("should throw error with correct class name", () => {
      class TestService extends BaseService {}
      const service = new TestService({});
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "TestService required for TestService"
      );
    });

    it("should handle missing serviceRegistry property in config", () => {
      const service = new BaseService({ otherProp: "value" });
      
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for BaseService"
      );
    });

    it("should return complex service registry object", () => {
      const complexRegistry = {
        register: jest.fn(),
        getService: jest.fn(),
        getMetadata: jest.fn(),
        reset: jest.fn()
      };
      const service = new BaseService({ serviceRegistry: complexRegistry });
      
      const result = service._requireServiceRegistry();
      
      expect(result).toBe(complexRegistry);
      expect(typeof result.register).toBe('function');
      expect(typeof result.getService).toBe('function');
    });
  });

  describe("_resolveNamespace method", () => {
    it("should return namespace when available in config", () => {
      const mockNamespace = { helpers: {} };
      const service = new BaseService({ namespace: mockNamespace });
      
      const result = service._resolveNamespace();
      
      expect(result).toBe(mockNamespace);
    });

    it("should throw error when no namespace provided in config", () => {
      const service = new BaseService({});
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });

    it("should throw error with correct class name", () => {
      class TestService extends BaseService {}
      const service = new TestService({});
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for TestService"
      );
    });

    it("should handle missing namespace property in config", () => {
      const service = new BaseService({ otherProp: "value" });
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });

    it("should return complex namespace object", () => {
      const complexNamespace = {
        helpers: { logging: {}, network: {} },
        services: {},
        metadata: { version: "1.0.0" }
      };
      const service = new BaseService({ namespace: complexNamespace });
      
      const result = service._resolveNamespace();
      
      expect(result).toBe(complexNamespace);
    });

    it("should handle null namespace value", () => {
      const service = new BaseService({ namespace: null });
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });

    it("should handle undefined namespace value", () => {
      const service = new BaseService({ namespace: undefined });
      
      expect(() => service._resolveNamespace()).toThrow(
        "Namespace required for BaseService"
      );
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with proper implementation", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      
      class FullLifecycleService extends BaseService {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          this.serviceRegistry = this._requireServiceRegistry();
          this.namespace = this._resolveNamespace();
          return this;
        }
      }
      
      const service = new FullLifecycleService({
        serviceRegistry: mockRegistry,
        namespace: mockNamespace
      });
      
      // Initially not initialized
      expect(service.initialized).toBe(false);
      expect(() => service._ensureInitialized()).toThrow();
      
      // After initialization
      const result = service.initialize();
      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.serviceRegistry).toBe(mockRegistry);
      expect(service.namespace).toBe(mockNamespace);
    });

    it("should prevent double initialization", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      
      class ProtectedService extends BaseService {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          this.initializationCount = (this.initializationCount || 0) + 1;
          return this;
        }
      }
      
      const service = new ProtectedService({
        serviceRegistry: mockRegistry,
        namespace: mockNamespace
      });
      service.initialize();
      
      expect(() => service.initialize()).toThrow("already initialized");
      expect(service.initializationCount).toBe(1);
    });

    it("should enforce initialization before usage pattern", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      
      class UsageService extends BaseService {
        initialize() {
          this._markInitialized();
          this.data = "ready";
          return this;
        }
        
        getData() {
          this._ensureInitialized();
          return this.data;
        }
      }
      
      const service = new UsageService({
        serviceRegistry: mockRegistry,
        namespace: mockNamespace
      });
      
      // Should throw before initialization
      expect(() => service.getData()).toThrow();
      
      // Should work after initialization
      service.initialize();
      expect(service.getData()).toBe("ready");
    });
  });

  describe("edge cases", () => {
    it("should handle inheritance correctly", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      
      class ParentService extends BaseService {
        initialize() {
          this._markInitialized();
          this.parentInit = true;
          this.serviceRegistry = this._requireServiceRegistry();
          this.namespace = this._resolveNamespace();
          return this;
        }
      }
      
      class ChildService extends ParentService {
        initialize() {
          super.initialize();
          this.childInit = true;
          return this;
        }
      }
      
      const service = new ChildService({
        serviceRegistry: mockRegistry,
        namespace: mockNamespace
      });
      service.initialize();
      
      expect(service.parentInit).toBe(true);
      expect(service.childInit).toBe(true);
      expect(service.initialized).toBe(true);
      expect(service.serviceRegistry).toBe(mockRegistry);
      expect(service.namespace).toBe(mockNamespace);
    });

    it("should handle multiple inheritance levels", () => {
      const mockRegistry = { register: jest.fn() };
      const mockNamespace = { helpers: {} };
      
      class Level1 extends BaseService {
        initialize() {
          this._markInitialized();
          this.level1 = true;
          return this;
        }
      }
      
      class Level2 extends Level1 {
        initialize() {
          super.initialize();
          this.level2 = true;
          return this;
        }
      }
      
      class Level3 extends Level2 {
        initialize() {
          super.initialize();
          this.level3 = true;
          return this;
        }
      }
      
      const service = new Level3({
        serviceRegistry: mockRegistry,
        namespace: mockNamespace
      });
      service.initialize();
      
      expect(service.level1).toBe(true);
      expect(service.level2).toBe(true);
      expect(service.level3).toBe(true);
      expect(service.initialized).toBe(true);
    });

    it("should preserve config through inheritance", () => {
      class TestService extends BaseService {}
      
      const config = { 
        serviceRegistry: { register: jest.fn() }, 
        namespace: { helpers: {} },
        custom: "config", 
        value: 42 
      };
      const service = new TestService(config);
      
      expect(service.config).toBe(config);
      service._markInitialized();
      expect(service.config).toBe(config);
    });

    it("should handle initialization error recovery", () => {
      class FailingService extends BaseService {
        initialize() {
          this._ensureNotInitialized();
          this.serviceRegistry = this._requireServiceRegistry(); // This will throw first
        }
      }
      
      const service = new FailingService({}); // No serviceRegistry provided
      expect(service.initialized).toBe(false);
      
      // Should remain not initialized after failed attempt
      expect(() => service.initialize()).toThrow("ServiceRegistry required");
      expect(service.initialized).toBe(false);
      
      // The _ensureNotInitialized should still work (since init failed)
      expect(() => service._ensureNotInitialized()).not.toThrow();
    });

    it("should handle both service registry and namespace missing", () => {
      class TestService extends BaseService {
        initialize() {
          this.serviceRegistry = this._requireServiceRegistry();
          this.namespace = this._resolveNamespace();
          this._markInitialized();
          return this;
        }
      }
      
      const service = new TestService({});
      
      // Should throw on first missing dependency (service registry)
      expect(() => service.initialize()).toThrow("ServiceRegistry required");
    });

    it("should handle service registry missing but namespace provided", () => {
      class TestService extends BaseService {
        initialize() {
          this.serviceRegistry = this._requireServiceRegistry();
          this.namespace = this._resolveNamespace();
          this._markInitialized();
          return this;
        }
      }
      
      const service = new TestService({
        namespace: { helpers: {} } // Only namespace, no serviceRegistry
      });
      
      // Should throw for missing service registry
      expect(() => service.initialize()).toThrow("ServiceRegistry required");
    });

    it("should handle service registry provided but namespace missing", () => {
      class TestService extends BaseService {
        initialize() {
          this.serviceRegistry = this._requireServiceRegistry();
          this.namespace = this._resolveNamespace();
          this._markInitialized();
          return this;
        }
      }
      
      const service = new TestService({
        serviceRegistry: { register: jest.fn() } // Only serviceRegistry, no namespace
      });
      
      // Should throw for missing namespace
      expect(() => service.initialize()).toThrow("Namespace required");
    });
  });
});