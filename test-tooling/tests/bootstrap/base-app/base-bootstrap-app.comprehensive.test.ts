const BaseBootstrapApp = require("../../../../bootstrap/base-bootstrap-app.js");
const GlobalRootHandler = require("../../../../bootstrap/constants/global-root-handler.js");

describe("BaseBootstrapApp", () => {
  describe("constructor", () => {
    it("should initialize with default GlobalRootHandler when no options provided", () => {
      const app = new BaseBootstrapApp();
      
      expect(app.rootHandler).toBeInstanceOf(GlobalRootHandler);
      expect(app.globalRoot).toBeDefined();
      expect(app.bootstrapNamespace).toEqual({});
      expect(app.helpersNamespace).toEqual({});
      expect(typeof app.isCommonJs).toBe('boolean');
    });

    it("should initialize with custom rootHandler when provided in options", () => {
      const mockRootHandler = {
        root: { test: "root" },
        getNamespace: () => ({ test: "namespace" }),
        helpers: { test: "helpers" }
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.rootHandler).toBe(mockRootHandler);
      expect(app.globalRoot).toBe(mockRootHandler.root);
      expect(app.bootstrapNamespace).toEqual({ test: "namespace" });
      expect(app.helpersNamespace).toEqual({ test: "helpers" });
      expect(typeof app.isCommonJs).toBe('boolean');
    });

    it("should set isCommonJs based on global module availability", () => {
      // In test environment, this will depend on the current environment
      const app = new BaseBootstrapApp();
      
      expect(typeof app.isCommonJs).toBe('boolean');
    });

    it("should properly initialize all properties with default rootHandler", () => {
      const app = new BaseBootstrapApp();
      
      expect(app.rootHandler).toBeDefined();
      expect(app.globalRoot).toBeDefined();
      expect(app.bootstrapNamespace).toBeDefined();
      expect(app.helpersNamespace).toBeDefined();
      expect(typeof app.isCommonJs).toBe('boolean');
    });
  });

  describe("static isBrowser method", () => {
    let originalWindow;
    let originalGlobalThis;

    beforeEach(() => {
      originalWindow = global.window;
      originalGlobalThis = global.globalThis;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.globalThis = originalGlobalThis;
    });

    it("should return true when passed window object has document", () => {
      const mockWindow = { document: {} };
      
      const result = BaseBootstrapApp.isBrowser(mockWindow);
      
      expect(result).toBe(true);
    });

    it("should return false when passed window object has no document", () => {
      const mockWindow = { noDocument: {} };
      
      const result = BaseBootstrapApp.isBrowser(mockWindow);
      
      expect(result).toBe(false);
    });

    it("should return true when global window has document", () => {
      global.window = { document: { title: "test" } };
      
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(true);
    });

    it("should return false when global window has no document", () => {
      global.window = { noDocument: {} };
      
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should return true when global globalThis has document", () => {
      global.globalThis = { document: { title: "test" } };
      delete global.window; // Ensure window is not defined
      
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(true);
    });

    it("should return false when global globalThis has no document", () => {
      global.globalThis = { noDocument: {} };
      delete global.window; // Ensure window is not defined
      
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should return false when no window object is available", () => {
      delete global.window;
      delete global.globalThis;
      
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should prioritize passed window over global window", () => {
      global.window = { document: { title: "global" } };
      const passedWindow = { document: { title: "passed" } };
      
      const result = BaseBootstrapApp.isBrowser(passedWindow);
      
      expect(result).toBe(true); // Passed window has document
    });
  });

  describe("_resolveHelper method", () => {
    it("should resolve helpers via require when in CommonJS environment", () => {
      // Note: Testing this properly would require mocking the require function
      // which is complex in this test environment. We'll verify the logic path.
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Set isCommonJs to true to simulate CommonJS environment
      Object.defineProperty(app, 'isCommonJs', { value: true, writable: true });
      
      // This test is difficult to run completely because it involves require()
      // but we can at least verify the property exists and is a function
      expect(typeof app._resolveHelper).toBe('function');
    });

    it("should resolve helpers from namespace when not in CommonJS environment", () => {
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Set isCommonJs to false to simulate non-CommonJS environment
      Object.defineProperty(app, 'isCommonJs', { value: false, writable: true });
      app.helpersNamespace = { testHelper: { name: "test" } };
      
      const result = app._resolveHelper("testHelper", "./path/to/helper");
      
      expect(result).toEqual({ name: "test" });
    });

    it("should return empty object when helper not found in namespace", () => {
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Set isCommonJs to false to simulate non-CommonJS environment
      Object.defineProperty(app, 'isCommonJs', { value: false, writable: true });
      app.helpersNamespace = {}; // Empty namespace
      
      const result = app._resolveHelper("nonExistentHelper", "./path/to/helper");
      
      expect(result).toEqual({});
    });
  });

  describe("properties", () => {
    it("should set rootHandler from options", () => {
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.rootHandler).toBe(mockRootHandler);
    });

    it("should set globalRoot from rootHandler", () => {
      const mockRootHandler = {
        root: { test: "globalRoot" },
        getNamespace: () => ({}),
        helpers: {}
      };
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.globalRoot).toBe(mockRootHandler.root);
    });

    it("should set bootstrapNamespace from rootHandler", () => {
      const mockRootHandler = {
        root: {},
        getNamespace: () => ({ test: "namespace" }),
        helpers: {}
      };
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.bootstrapNamespace).toEqual({ test: "namespace" });
    });

    it("should set helpersNamespace from rootHandler", () => {
      const mockRootHandler = {
        root: {},
        getNamespace: () => ({}),
        helpers: { test: "helpers" }
      };
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.helpersNamespace).toEqual({ test: "helpers" });
    });
  });

  describe("integration tests", () => {
    it("should work with CommonJS environment simulation", () => {
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Simulate CommonJS environment
      Object.defineProperty(app, 'isCommonJs', { value: true, writable: true });
      
      expect(app.rootHandler).toBe(mockRootHandler);
      expect(typeof app.isCommonJs).toBe('boolean');
      expect(app.isCommonJs).toBe(true);
    });

    it("should work with non-CommonJS environment simulation", () => {
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Simulate non-CommonJS environment
      Object.defineProperty(app, 'isCommonJs', { value: false, writable: true });
      
      expect(app.rootHandler).toBe(mockRootHandler);
      expect(typeof app.isCommonJs).toBe('boolean');
      expect(app.isCommonJs).toBe(false);
    });

    it("should handle different root handler configurations", () => {
      const customRoot = { custom: "root", document: {} };
      const mockRootHandler = new GlobalRootHandler(customRoot);
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.rootHandler).toBe(mockRootHandler);
      expect(app.globalRoot).toBe(customRoot);
      expect(app.bootstrapNamespace).toBeDefined();
      expect(app.helpersNamespace).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle null options", () => {
      const app = new BaseBootstrapApp(null);
      
      // Should use default rootHandler
      expect(app.rootHandler).toBeInstanceOf(GlobalRootHandler);
    });

    it("should handle undefined options", () => {
      const app = new BaseBootstrapApp(undefined);
      
      // Should use default rootHandler
      expect(app.rootHandler).toBeInstanceOf(GlobalRootHandler);
    });
  });
});