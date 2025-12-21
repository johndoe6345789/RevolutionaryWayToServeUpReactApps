import BaseHelper from "../../bootstrap/helpers/base-helper.js";

describe("BaseHelper", () => {
  let baseHelper;

  beforeEach(() => {
    // Create a mock helper registry
    const mockHelperRegistry = {
      register: jest.fn(),
      isRegistered: jest.fn(),
    };
    
    const config = { helperRegistry: mockHelperRegistry };
    baseHelper = new BaseHelper(config);
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
  });

  describe("initialize method", () => {
    it("should throw an error when called directly on base class", () => {
      expect(() => {
        baseHelper.initialize();
      }).toThrow("BaseHelper must implement initialize()");
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
  });
});