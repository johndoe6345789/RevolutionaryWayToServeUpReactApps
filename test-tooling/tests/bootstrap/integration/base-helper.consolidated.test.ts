import BaseHelper from "../../bootstrap/helpers/base-helper.js";

// Create a mock helper registry for testing
class MockHelperRegistry {
  constructor() {
    this._helpers = new Map();
    this._metadata = new Map();
  }

  register(name, helper, metadata = {}) {
    if (this._helpers.has(name)) {
      throw new Error(`Helper already registered: ${name}`);
    }
    this._helpers.set(name, helper);
    this._metadata.set(name, metadata);
  }

  getHelper(name) {
    return this._helpers.get(name);
  }

  isRegistered(name) {
    return this._helpers.has(name);
  }

  getMetadata(name) {
    return this._metadata.get(name);
  }

  listHelpers() {
    return Array.from(this._helpers.keys());
  }
}

describe("BaseHelper", () => {
  let baseHelper;
  let mockRegistry;

  beforeEach(() => {
    mockRegistry = new MockHelperRegistry();
    baseHelper = new BaseHelper();
  });

  describe("constructor", () => {
    it("should initialize with a config object", () => {
      const config = { helperRegistry: { register: jest.fn(), isRegistered: jest.fn() } };
      const helper = new BaseHelper(config);

      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with empty config if not provided", () => {
      const helper = new BaseHelper();

      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with empty config by default", () => {
      const helper = new BaseHelper();

      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with an empty config object when no config provided", () => {
      const helper = new BaseHelper();
      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with provided config object", () => {
      const config = { test: "value" };
      const helper = new BaseHelper(config);
      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with null config as null", () => {
      const helper = new BaseHelper(null);
      expect(helper.config).toBeNull();
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with undefined config as empty object", () => {
      const helper = new BaseHelper(undefined);
      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });
  });

  describe("_resolveHelperRegistry method", () => {
    it("should return the helper registry from config", () => {
      const mockRegistry = { register: jest.fn(), isRegistered: jest.fn() };
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);

      const registry = helper._resolveHelperRegistry();

      expect(registry).toBe(mockRegistry);
    });

    it("should throw an error if no helper registry is provided in config", () => {
      const helper = new BaseHelper({});

      expect(() => {
        helper._resolveHelperRegistry();
      }).toThrow("HelperRegistry required for BaseHelper");
    });

    it("should throw an error if helper registry is null", () => {
      const config = { helperRegistry: null };
      const helper = new BaseHelper(config);

      expect(() => {
        helper._resolveHelperRegistry();
      }).toThrow("HelperRegistry required for BaseHelper");
    });

    it("should throw an error if helper registry is undefined", () => {
      const config = { helperRegistry: undefined };
      const helper = new BaseHelper(config);

      expect(() => {
        helper._resolveHelperRegistry();
      }).toThrow("HelperRegistry required for BaseHelper");
    });

    it("should return the helper registry from config when available", () => {
      const registry = new MockHelperRegistry();
      const config = { helperRegistry: registry };
      const helper = new BaseHelper(config);

      expect(helper._resolveHelperRegistry()).toBe(registry);
    });

    it("should include the class name in the error message", () => {
      class TestHelper extends BaseHelper {}
      const config = { helperRegistry: null };
      const helper = new TestHelper(config);

      expect(() => {
        helper._resolveHelperRegistry();
      }).toThrow(`HelperRegistry required for TestHelper`);
    });
  });

  describe("_registerHelper method", () => {
    it("should register the helper if not already registered", () => {
      const mockRegistry = {
        register: jest.fn(),
        isRegistered: jest.fn().mockReturnValue(false), // Not registered
      };

      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const mockHelper = { name: "testHelper" };

      helper._registerHelper("testHelper", mockHelper);

      expect(mockRegistry.isRegistered).toHaveBeenCalledWith("testHelper");
      expect(mockRegistry.register).toHaveBeenCalledWith("testHelper", mockHelper, {}, []);
    });

    it("should register the helper with provided metadata", () => {
      const mockRegistry = {
        register: jest.fn(),
        isRegistered: jest.fn().mockReturnValue(false), // Not registered
      };

      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const mockHelper = { name: "testHelper" };
      const metadata = { type: "service", version: "1.0" };

      helper._registerHelper("testHelper", mockHelper, metadata);

      expect(mockRegistry.register).toHaveBeenCalledWith("testHelper", mockHelper, metadata, []);
    });

    it("should skip registration if helper already exists", () => {
      const mockRegistry = {
        register: jest.fn(),
        isRegistered: jest.fn().mockReturnValue(true), // Already registered
      };

      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const mockHelper = { name: "testHelper" };

      helper._registerHelper("testHelper", mockHelper);

      expect(mockRegistry.isRegistered).toHaveBeenCalledWith("testHelper");
      expect(mockRegistry.register).not.toHaveBeenCalled();
    });

    it("should throw an error if helper registry is missing", () => {
      const helper = new BaseHelper({});

      expect(() => {
        helper._registerHelper("testHelper", {});
      }).toThrow("HelperRegistry required for BaseHelper");
    });

    it("should register the helper if not already registered", () => {
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const testHelper = { name: "test" };

      helper._registerHelper("testHelper", testHelper, { folder: "test" });

      expect(mockRegistry.isRegistered("testHelper")).toBe(true);
      expect(mockRegistry.getHelper("testHelper")).toBe(testHelper);
      expect(mockRegistry.getMetadata("testHelper")).toEqual({ folder: "test" });
    });

    it("should register the helper with provided metadata", () => {
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const testHelper = { name: "test" };
      const metadata = { folder: "custom", domain: "test" };

      helper._registerHelper("testHelper", testHelper, metadata);

      expect(mockRegistry.getMetadata("testHelper")).toEqual(metadata);
    });

    it("should skip registration if helper already exists", () => {
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const firstHelper = { name: "first" };
      const secondHelper = { name: "second" };

      // Register first helper
      mockRegistry.register("testHelper", firstHelper, { folder: "first" });

      // Try to register with _registerHelper (should not overwrite)
      helper._registerHelper("testHelper", secondHelper, { folder: "second" });

      // Should still have the first helper
      expect(mockRegistry.getHelper("testHelper")).toBe(firstHelper);
      expect(mockRegistry.getMetadata("testHelper")).toEqual({ folder: "first" });
    });

    it("should throw an error if helper registry is missing", () => {
      const helper = new BaseHelper({});

      expect(() => {
        helper._registerHelper("testHelper", { name: "test" });
      }).toThrow(`HelperRegistry required for BaseHelper`);
    });

    it("should use empty metadata object when not provided", () => {
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      const testHelper = { name: "test" };

      helper._registerHelper("testHelper", testHelper);

      expect(mockRegistry.getMetadata("testHelper")).toEqual({});
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly on base class", () => {
      expect(() => {
        baseHelper.initialize();
      }).toThrow("BaseHelper must implement initialize()");
    });

    it("should throw an error with the correct class name", () => {
      class TestHelper extends BaseHelper {}
      const testHelper = new TestHelper();

      expect(() => {
        testHelper.initialize();
      }).toThrow("TestHelper must implement initialize()");
    });
  });

  describe("integration tests", () => {
    it("should work with a real helper registry", () => {
      const registry = {
        register: jest.fn(),
        isRegistered: jest.fn().mockReturnValue(false),
      };

      const config = { helperRegistry: registry };
      const helper = new BaseHelper(config);

      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);

      const mockHelper = { someMethod: jest.fn() };
      helper._registerHelper("myHelper", mockHelper);

      expect(registry.register).toHaveBeenCalledWith("myHelper", mockHelper, {}, []);
    });

    it("should handle registration scenarios correctly", () => {
      const registry = {
        register: jest.fn(),
        isRegistered: jest.fn()
          .mockReturnValueOnce(false) // First call: not registered
          .mockReturnValueOnce(true), // Second call: already registered
      };

      const config = { helperRegistry: registry };
      const helper = new BaseHelper(config);

      // First registration should happen
      helper._registerHelper("helper1", { method: () => {} });
      expect(registry.register).toHaveBeenCalledTimes(1);

      // Second registration with same name should be skipped
      helper._registerHelper("helper1", { method: () => {} });
      expect(registry.register).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should work with a real helper registry", () => {
      const registry = new MockHelperRegistry();
      const config = { helperRegistry: registry };
      const helper = new BaseHelper(config);

      // Test that we can resolve the registry
      expect(helper._resolveHelperRegistry()).toBe(registry);

      // Test that we can register a helper
      const testService = { service: "test" };
      helper._registerHelper("testService", testService, { folder: "services" });

      expect(registry.isRegistered("testService")).toBe(true);
      expect(registry.getHelper("testService")).toBe(testService);
      expect(registry.getMetadata("testService")).toEqual({ folder: "services" });
    });

    it("should handle registration scenarios correctly", () => {
      const registry = new MockHelperRegistry();
      const config = { helperRegistry: registry };
      const helper = new BaseHelper(config);

      // Register a helper
      const service1 = { id: 1 };
      helper._registerHelper("service1", service1);

      // Verify it was registered
      expect(registry.isRegistered("service1")).toBe(true);
      expect(registry.getHelper("service1")).toBe(service1);

      // Try to register another helper with the same name (should not overwrite)
      const service2 = { id: 2 };
      helper._registerHelper("service1", service2); // Should not register since already exists

      // Should still have the first service
      expect(registry.getHelper("service1")).toBe(service1);
    });
  });
});