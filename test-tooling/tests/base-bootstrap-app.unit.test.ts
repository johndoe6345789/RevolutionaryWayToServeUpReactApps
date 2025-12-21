import BaseBootstrapApp from "../../bootstrap/interfaces/base-bootstrap-app.js";

describe("BaseBootstrapApp", () => {
  let baseBootstrapApp: any;
  let mockRootHandler: any;

  beforeEach(() => {
    // Create a mock root handler
    mockRootHandler = {
      root: {},
      getNamespace: jest.fn(() => ({})),
      helpers: {}
    };

    // Create a new instance of BaseBootstrapApp for each test
    baseBootstrapApp = new BaseBootstrapApp({ rootHandler: mockRootHandler });
  });

  describe("constructor", () => {
    it("should initialize with provided root handler", () => {
      expect(baseBootstrapApp.rootHandler).toBe(mockRootHandler);
      expect(baseBootstrapApp.globalRoot).toBe(mockRootHandler.root);
      expect(baseBootstrapApp.bootstrapNamespace).toBe(mockRootHandler.getNamespace());
      expect(baseBootstrapApp.helpersNamespace).toBe(mockRootHandler.helpers);
    });

    it("should detect CommonJS environment properly", () => {
      // This test depends on the actual environment
      expect(baseBootstrapApp.isCommonJs).toBeDefined();
    });

    it("should use GlobalRootHandler by default if none provided", () => {
      // Create instance without providing rootHandler to use default
      const appWithDefault = new BaseBootstrapApp();
      expect(appWithDefault.rootHandler).toBeDefined();
    });
  });

  describe("static isBrowser method", () => {
    it("should return true when window and document are available", () => {
      const mockWindow = {
        document: {}
      } as any;

      const result = BaseBootstrapApp.isBrowser(mockWindow);
      expect(result).toBe(true);
    });

    it("should return false when window is not provided", () => {
      const result = BaseBootstrapApp.isBrowser(undefined);
      expect(result).toBe(false);
    });

    it("should return false when window has no document", () => {
      const mockWindow = {} as any;

      const result = BaseBootstrapApp.isBrowser(mockWindow);
      expect(result).toBe(false);
    });

    it("should work with globalThis when window is not available", () => {
      const mockGlobalThis = {
        document: {}
      } as any;

      const result = BaseBootstrapApp.isBrowser(mockGlobalThis);
      expect(result).toBe(true);
    });
  });

  describe("_resolveHelper method", () => {
    it("should use require in CommonJS environment", () => {
      // Mock CommonJS environment
      baseBootstrapApp.isCommonJs = true;
      const mockPath = "./mock-helper.js";

      // Mock require to return a simple object
      const originalRequire = (global as any).require;
      (global as any).require = jest.fn(() => ({ mockHelper: true }));

      const result = baseBootstrapApp._resolveHelper("mockHelper", mockPath);

      expect((global as any).require).toHaveBeenCalledWith(mockPath);
      expect(result).toEqual({ mockHelper: true });

      // Restore original require
      (global as any).require = originalRequire;
    });

    it("should use helpers namespace in non-CommonJS environment", () => {
      // Mock non-CommonJS environment
      baseBootstrapApp.isCommonJs = false;
      baseBootstrapApp.helpersNamespace = { mockHelper: { data: "test" } };
      
      const result = baseBootstrapApp._resolveHelper("mockHelper", "./mock-path.js");
      
      expect(result).toEqual({ data: "test" });
    });

    it("should return empty object if helper not found in non-CommonJS environment", () => {
      baseBootstrapApp.isCommonJs = false;
      baseBootstrapApp.helpersNamespace = {};
      
      const result = baseBootstrapApp._resolveHelper("nonExistentHelper", "./path.js");
      
      expect(result).toEqual({});
    });
  });

  describe("property access", () => {
    it("should properly set root handler properties", () => {
      expect(baseBootstrapApp.rootHandler).toBe(mockRootHandler);
      expect(baseBootstrapApp.globalRoot).toBe(mockRootHandler.root);
    });

    it("should have helpers namespace", () => {
      expect(baseBootstrapApp.helpersNamespace).toBeDefined();
    });
  });
});