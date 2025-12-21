// Comprehensive test suite for BaseEntryPoint class
// This replaces the failing Jest-based tests with proper Bun tests

// We'll need to mock the dependencies appropriately for Bun's test environment
const BaseEntryPoint = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

// Mock service registry
const mockServiceRegistry = {
  register: () => {},
  get: () => {},
  reset: () => {}
};

// Mock root handler
class MockRootHandler {
  constructor() {
    this.root = { name: "mock-root" };
    this.namespace = { helpers: {} };
    this.document = { documentElement: true };
  }

  getNamespace() {
    return this.namespace;
  }

  getDocument() {
    return this.document;
  }
}

// Since we can't easily mock modules in Bun the same way as Jest, 
// we'll test by providing controlled inputs to the constructor
describe("BaseEntryPoint", () => {
  describe("constructor", () => {
    test("should create an instance with provided options", () => {
      // Create mock classes for testing
      class MockService {}
      class MockConfig {}
      
      const configFactory = () => ({});
      
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });
      
      expect(entrypoint.ServiceClass).toBe(MockService);
      expect(entrypoint.ConfigClass).toBe(MockConfig);
      expect(entrypoint.configFactory).toBe(configFactory);
      // The rootHandler should be instantiated (though with real implementation)
      expect(entrypoint.rootHandler).toBeDefined();
    });
  });

  describe("_createConfig method", () => {
    test("should create config with proper parameters", () => {
      // Create mock classes
      class MockConfig {
        constructor(options) {
          this.options = options;
        }
      }
      
      const factoryCallTracker = { called: false, params: null };
      const configFactory = (params) => {
        factoryCallTracker.called = true;
        factoryCallTracker.params = params;
        return { custom: "value" };
      };
      
      const entrypoint = new BaseEntryPoint({
        ServiceClass: class {},
        ConfigClass: MockConfig,
        configFactory
      });
      
      const config = entrypoint._createConfig();
      
      // Verify the factory was called
      expect(factoryCallTracker.called).toBe(true);
      expect(config.options.custom).toBe("value");
    });
  });

  describe("run method", () => {
    test("should instantiate service, call initialize, and return service", () => {
      // Track method calls
      const methodCalls = {
        initialize: false,
        install: false
      };
      
      class MockService {
        constructor(config) {
          this.config = config;
        }
        
        initialize() {
          methodCalls.initialize = true;
          return this;
        }
      }
      
      class MockConfig {}
      
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });
      
      const service = entrypoint.run();
      
      expect(methodCalls.initialize).toBe(true);
      expect(service).toBeInstanceOf(MockService);
      expect(service.config).toBeDefined();
    });

    test("should call install method if it exists", () => {
      const methodCalls = {
        initialize: false,
        install: false
      };
      
      class MockService {
        constructor(config) {
          this.config = config;
        }
        
        initialize() {
          methodCalls.initialize = true;
          return this;
        }
        
        install() {
          methodCalls.install = true;
        }
      }
      
      class MockConfig {}
      
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });
      
      const service = entrypoint.run();
      
      expect(methodCalls.initialize).toBe(true);
      expect(methodCalls.install).toBe(true);
      expect(service).toBeInstanceOf(MockService);
    });

    test("should not call install if it doesn't exist", () => {
      const methodCalls = {
        initialize: false,
        install: false
      };
      
      class MockService {
        constructor(config) {
          this.config = config;
        }
        
        initialize() {
          methodCalls.initialize = true;
          return this;
        }
        
        // No install method
      }
      
      class MockConfig {}
      
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });
      
      const service = entrypoint.run();
      
      expect(methodCalls.initialize).toBe(true);
      // Install should not be called since it doesn't exist
      expect(service).toBeInstanceOf(MockService);
    });
  });

  test("integration: full lifecycle works correctly", () => {
    const lifecycleTracker = {
      configFactoryCalled: false,
      serviceInitialized: false,
      serviceInstalled: false
    };
    
    class TestConfig {
      constructor(options) {
        this.options = options;
        lifecycleTracker.configFactoryCalled = true;
      }
    }
    
    class TestService {
      constructor(config) {
        this.config = config;
      }
      
      initialize() {
        lifecycleTracker.serviceInitialized = true;
        return this;
      }
      
      install() {
        lifecycleTracker.serviceInstalled = true;
      }
    }
    
    const configFactory = (params) => {
      return { testParam: "testValue", ...params };
    };
    
    const entrypoint = new BaseEntryPoint({
      ServiceClass: TestService,
      ConfigClass: TestConfig,
      configFactory
    });
    
    const service = entrypoint.run();
    
    // Verify the full lifecycle worked
    expect(lifecycleTracker.configFactoryCalled).toBe(true);
    expect(lifecycleTracker.serviceInitialized).toBe(true);
    expect(lifecycleTracker.serviceInstalled).toBe(true);
    expect(service).toBeInstanceOf(TestService);
    expect(service.config).toBeInstanceOf(TestConfig);
    expect(service.config.options.testParam).toBe("testValue");
  });
});