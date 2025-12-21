import BaseHelper from "../../../../bootstrap/helpers/base-helper.js";

// Mock helper registry for testing
class MockHelperRegistry {
  constructor() {
    this.registeredHelpers = new Map();
  }
  
  register(name, helper, metadata) {
    this.registeredHelpers.set(name, { helper, metadata });
  }
  
  isRegistered(name) {
    return this.registeredHelpers.has(name);
  }
}

describe("BaseHelper", () => {
  describe("constructor", () => {
    it("should initialize with default empty config", () => {
      const helper = new BaseHelper();
      
      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });

    it("should accept and store configuration", () => {
      const config = { test: "value", other: "data" };
      const helper = new BaseHelper(config);
      
      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
    });

    it("should set initialized to false by default", () => {
      const helper = new BaseHelper();
      
      expect(helper.initialized).toBe(false);
    });
  });

  describe("_resolveHelperRegistry method", () => {
    it("should return the helper registry from config", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      
      const registry = helper._resolveHelperRegistry();
      
      expect(registry).toBe(mockRegistry);
    });

    it("should throw an error when no helper registry is provided", () => {
      const helper = new BaseHelper({});
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });

    it("should throw an error when helperRegistry is null", () => {
      const config = { helperRegistry: null };
      const helper = new BaseHelper(config);
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });

    it("should throw an error when helperRegistry is undefined", () => {
      const config = { helperRegistry: undefined };
      const helper = new BaseHelper(config);
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });
  });

  describe("_registerHelper method", () => {
    it("should register a helper when not already registered", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      
      const testHelper = { test: "helper" };
      const metadata = { type: "test" };
      
      helper._registerHelper("testHelper", testHelper, metadata);
      
      expect(mockRegistry.isRegistered("testHelper")).toBe(true);
      const registered = mockRegistry.registeredHelpers.get("testHelper");
      expect(registered.helper).toBe(testHelper);
      expect(registered.metadata).toEqual(metadata);
    });

    it("should not register a helper when already registered", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      
      // Register once
      const firstHelper = { first: "helper" };
      helper._registerHelper("testHelper", firstHelper);
      
      // Register again with different helper
      const secondHelper = { second: "helper" };
      helper._registerHelper("testHelper", secondHelper);
      
      // Should still have the first helper
      const registered = mockRegistry.registeredHelpers.get("testHelper");
      expect(registered.helper).toBe(firstHelper);
    });

    it("should use empty metadata when not provided", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      
      const testHelper = { test: "helper" };
      
      helper._registerHelper("testHelper", testHelper);
      
      const registered = mockRegistry.registeredHelpers.get("testHelper");
      expect(registered.metadata).toEqual({});
    });

    it("should throw when no helper registry is available", () => {
      const helper = new BaseHelper({});
      
      expect(() => helper._registerHelper("test", {})).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly", () => {
      const helper = new BaseHelper();
      
      expect(() => helper.initialize()).toThrow(
        "BaseHelper must implement initialize()"
      );
    });

    it("should be overridable by subclasses", () => {
      class TestHelper extends BaseHelper {
        initialize() {
          return "initialized";
        }
      }
      
      const helper = new TestHelper();
      const result = helper.initialize();
      
      expect(result).toBe("initialized");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with proper configuration", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry, custom: "value" };
      const helper = new BaseHelper(config);
      
      // Verify initial state
      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
      
      // Register a helper
      const testHelper = { functionality: "test" };
      helper._registerHelper("testHelper", testHelper, { category: "test" });
      
      // Verify registration worked
      expect(mockRegistry.isRegistered("testHelper")).toBe(true);
      const registered = mockRegistry.registeredHelpers.get("testHelper");
      expect(registered.helper).toBe(testHelper);
      expect(registered.metadata).toEqual({ category: "test" });
    });

    it("should handle multiple helper registrations", () => {
      const mockRegistry = new MockHelperRegistry();
      const config = { helperRegistry: mockRegistry };
      const helper = new BaseHelper(config);
      
      // Register multiple helpers
      helper._registerHelper("helper1", { name: "first" });
      helper._registerHelper("helper2", { name: "second" });
      helper._registerHelper("helper3", { name: "third" });
      
      // Verify all were registered
      expect(mockRegistry.isRegistered("helper1")).toBe(true);
      expect(mockRegistry.isRegistered("helper2")).toBe(true);
      expect(mockRegistry.isRegistered("helper3")).toBe(true);
      
      // Verify correct helpers were registered
      expect(mockRegistry.registeredHelpers.get("helper1").helper.name).toBe("first");
      expect(mockRegistry.registeredHelpers.get("helper2").helper.name).toBe("second");
      expect(mockRegistry.registeredHelpers.get("helper3").helper.name).toBe("third");
    });
  });
});