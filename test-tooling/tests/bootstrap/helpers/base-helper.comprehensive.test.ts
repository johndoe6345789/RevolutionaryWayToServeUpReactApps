import BaseHelper from "../../../../bootstrap/helpers/base-helper.js";

describe("BaseHelper", () => {
  describe("constructor", () => {
    it("should initialize with empty config when no config provided", () => {
      const helper = new BaseHelper();
      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with provided config", () => {
      const config = { test: "value", helperRegistry: {} };
      const helper = new BaseHelper(config);
      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
    });

    it("should store null config when null is explicitly provided", () => {
      const helper = new BaseHelper(null);
      expect(helper.config).toBeNull();
      expect(helper.initialized).toBe(false);
    });

    it("should initialize with empty object when undefined config provided", () => {
      const helper = new BaseHelper(undefined);
      expect(helper.config).toEqual({});
      expect(helper.initialized).toBe(false);
    });
  });

  describe("_resolveHelperRegistry method", () => {
    it("should return the helper registry from config when available", () => {
      const mockRegistry = { register: jest.fn() };
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      
      const result = helper._resolveHelperRegistry();
      
      expect(result).toBe(mockRegistry);
    });

    it("should throw error when no helper registry provided in config", () => {
      const helper = new BaseHelper({});
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });

    it("should throw error with correct class name", () => {
      class TestHelper extends BaseHelper {}
      const helper = new TestHelper({});
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for TestHelper"
      );
    });

    it("should handle missing helperRegistry property in config", () => {
      const helper = new BaseHelper({ otherProp: "value" });
      
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });
  });

  describe("_registerHelper method", () => {
    let mockRegistry;

    beforeEach(() => {
      mockRegistry = {
        isRegistered: jest.fn(),
        register: jest.fn()
      };
    });

    it("should register helper when not already registered", () => {
      mockRegistry.isRegistered.mockReturnValue(false);
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      const testHelper = { method: () => {} };
      const metadata = { scope: "global" };
      
      helper._registerHelper("testHelper", testHelper, metadata);
      
      expect(mockRegistry.isRegistered).toHaveBeenCalledWith("testHelper");
      expect(mockRegistry.register).toHaveBeenCalledWith("testHelper", testHelper, metadata, []);
    });

    it("should register helper with default empty metadata", () => {
      mockRegistry.isRegistered.mockReturnValue(false);
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      const testHelper = { method: () => {} };
      
      helper._registerHelper("testHelper", testHelper);
      
      expect(mockRegistry.register).toHaveBeenCalledWith("testHelper", testHelper, {}, []);
    });

    it("should skip registration when helper is already registered", () => {
      mockRegistry.isRegistered.mockReturnValue(true);
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      const testHelper = { method: () => {} };
      
      helper._registerHelper("existingHelper", testHelper);
      
      expect(mockRegistry.isRegistered).toHaveBeenCalledWith("existingHelper");
      expect(mockRegistry.register).not.toHaveBeenCalled();
    });

    it("should call _resolveHelperRegistry internally", () => {
      const resolveSpy = jest.spyOn(BaseHelper.prototype, '_resolveHelperRegistry')
        .mockReturnValue(mockRegistry);
      
      mockRegistry.isRegistered.mockReturnValue(false);
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      helper._registerHelper("test", {});
      
      expect(resolveSpy).toHaveBeenCalled();
      resolveSpy.mockRestore();
    });

    it("should throw error if no registry available", () => {
      const helper = new BaseHelper({});
      
      expect(() => helper._registerHelper("test", {})).toThrow(
        "HelperRegistry required for BaseHelper"
      );
    });
  });

  describe("initialize method", () => {
    it("should throw error when called on base class directly", () => {
      const helper = new BaseHelper();
      
      expect(() => helper.initialize()).toThrow(
        "BaseHelper must implement initialize()"
      );
    });

    it("should throw error with correct class name", () => {
      class CustomHelper extends BaseHelper {}
      const helper = new CustomHelper();
      
      expect(() => helper.initialize()).toThrow(
        "CustomHelper must implement initialize()"
      );
    });

    it("should not throw when implemented in subclass", () => {
      class ImplementedHelper extends BaseHelper {
        initialize() {
          return "initialized";
        }
      }
      const helper = new ImplementedHelper();
      
      expect(() => helper.initialize()).not.toThrow();
      expect(helper.initialize()).toBe("initialized");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with implemented subclass", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockReturnValue(false),
        register: jest.fn()
      };
      
      class TestHelper extends BaseHelper {
        initialize() {
          this._registerHelper("test", { value: "test" }, { type: "integration" });
          return this;
        }
      }
      
      const helper = new TestHelper({ helperRegistry: mockRegistry });
      const result = helper.initialize();
      
      expect(result).toBe(helper);
      expect(mockRegistry.register).toHaveBeenCalledWith(
        "test",
        { value: "test" },
        { type: "integration" },
        []
      );
    });

    it("should handle registration with existing helper", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockReturnValue(true),
        register: jest.fn()
      };
      
      class TestHelper extends BaseHelper {
        initialize() {
          this._registerHelper("existing", { value: "test" });
          return this;
        }
      }
      
      const helper = new TestHelper({ helperRegistry: mockRegistry });
      const result = helper.initialize();
      
      expect(result).toBe(helper);
      expect(mockRegistry.register).not.toHaveBeenCalled();
    });

    it("should maintain config throughout lifecycle", () => {
      const config = { 
        helperRegistry: { isRegistered: () => false, register: () => {} },
        customOption: "value" 
      };
      
      class TestHelper extends BaseHelper {
        initialize() {
          return this.config.customOption;
        }
      }
      
      const helper = new TestHelper(config);
      const result = helper.initialize();
      
      expect(result).toBe("value");
      expect(helper.config).toBe(config);
    });
  });

  describe("edge cases", () => {
    it("should handle registry with complex metadata", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockReturnValue(false),
        register: jest.fn()
      };
      
      const complexMetadata = {
        version: "1.0.0",
        dependencies: ["helper1", "helper2"],
        config: { enabled: true, options: { debug: false } }
      };
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      helper._registerHelper("complexHelper", { complex: true }, complexMetadata);
      
      expect(mockRegistry.register).toHaveBeenCalledWith(
        "complexHelper", 
        { complex: true }, 
        complexMetadata
      );
    });

    it("should handle null or undefined helper values", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockReturnValue(false),
        register: jest.fn()
      };
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      
      helper._registerHelper("nullHelper", null);
      helper._registerHelper("undefinedHelper", undefined);
      
      expect(mockRegistry.register).toHaveBeenNthCalledWith(1, "nullHelper", null, {});
      expect(mockRegistry.register).toHaveBeenNthCalledWith(2, "undefinedHelper", undefined, {});
    });

    it("should handle registry that throws during isRegistered", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockImplementation(() => {
          throw new Error("Registry error");
        }),
        register: jest.fn()
      };
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      
      expect(() => helper._registerHelper("failingHelper", {})).toThrow("Registry error");
    });

    it("should handle registry that throws during register", () => {
      const mockRegistry = {
        isRegistered: jest.fn().mockReturnValue(false),
        register: jest.fn().mockImplementation(() => {
          throw new Error("Registration error");
        })
      };
      
      const helper = new BaseHelper({ helperRegistry: mockRegistry });
      
      expect(() => helper._registerHelper("failingHelper", {})).toThrow("Registration error");
    });
  });
});