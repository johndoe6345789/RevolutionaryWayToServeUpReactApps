import BaseBootstrapApp from "../../bootstrap/base-bootstrap-app.js";

// Mock the GlobalRootHandler
jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        root: { document: {}, fetch: jest.fn() },
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: {},
        hasDocument: jest.fn().mockReturnValue(true),
        hasWindow: jest.fn().mockReturnValue(true),
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
    })
  };
});

describe("BaseBootstrapApp", () => {
  let originalModule;
  let originalExports;

  beforeAll(() => {
    // Save original module properties
    originalModule = global.module;
    originalExports = global.exports;
  });

  afterAll(() => {
    // Restore original module properties
    global.module = originalModule;
    global.exports = originalExports;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset module to a clean state for each test
    global.module = { exports: {} };
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const app = new BaseBootstrapApp();
      
      expect(app).toBeDefined();
      expect(app.rootHandler).toBeDefined();
      expect(app.globalRoot).toBeDefined();
      expect(app.bootstrapNamespace).toBeDefined();
      expect(app.helpersNamespace).toBeDefined();
      expect(app.isCommonJs).toBeDefined();
    });

    it("should initialize with custom rootHandler", () => {
      const mockRootHandler = {
        root: { document: {} },
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: {},
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.rootHandler).toBe(mockRootHandler);
      expect(app.globalRoot).toBe(mockRootHandler.root);
    });

    it("should set isCommonJs to true when module exists", () => {
      global.module = { exports: {} };
      const app = new BaseBootstrapApp();
      
      expect(app.isCommonJs).toBe(true);
    });

    it("should set isCommonJs to false when module does not exist", () => {
      // Temporarily remove module
      delete global.module;
      const app = new BaseBootstrapApp();
      
      expect(app.isCommonJs).toBe(false);
      
      // Restore module
      global.module = { exports: {} };
    });
  });

  describe("static isBrowser method", () => {
    beforeEach(() => {
      // Clean up global properties before each test
      delete global.window;
      delete global.globalThis;
    });

    afterEach(() => {
      // Clean up global properties after each test
      delete global.window;
      delete global.globalThis;
    });

    it("should return true when passed window object has document", () => {
      const mockWindow = { document: {} };
      const result = BaseBootstrapApp.isBrowser(mockWindow);
      
      expect(result).toBe(true);
    });

    it("should return false when passed window object has no document", () => {
      const mockWindow = {};
      const result = BaseBootstrapApp.isBrowser(mockWindow);
      
      expect(result).toBe(false);
    });

    it("should return true when global window has document", () => {
      global.window = { document: {} };
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(true);
    });

    it("should return false when global window has no document", () => {
      global.window = {};
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should return true when global globalThis has document", () => {
      global.globalThis = { document: {} };
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(true);
    });

    it("should return false when global globalThis has no document", () => {
      global.globalThis = {};
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should return false when no window object is available", () => {
      const result = BaseBootstrapApp.isBrowser();
      
      expect(result).toBe(false);
    });

    it("should prioritize passed window over global window", () => {
      global.window = { document: {} }; // Global has document
      const mockWindow = {}; // Passed window has no document
      const result = BaseBootstrapApp.isBrowser(mockWindow);
      
      expect(result).toBe(false); // Should return false because passed window has no document
    });
  });

  describe("_resolveHelper method", () => {
    it("should resolve helpers via require when in CommonJS", () => {
      global.module = { exports: {} };
      const app = new BaseBootstrapApp();
      
      // Mock require function
      const originalRequire = global.require;
      global.require = jest.fn().mockReturnValue("mocked helper");
      
      const result = app._resolveHelper("testHelper", "./test/path.js");
      
      expect(global.require).toHaveBeenCalledWith("./test/path.js");
      expect(result).toBe("mocked helper");
      
      // Restore original require
      global.require = originalRequire;
    });

    it("should resolve helpers from namespace when not in CommonJS", () => {
      // Remove module to simulate non-CommonJS environment
      delete global.module;
      const mockHelper = { someMethod: jest.fn() };
      const mockRootHandler = {
        root: {},
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: { testHelper: mockHelper },
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const BaseBootstrapApp = require("../../bootstrap/base-bootstrap-app.js").default;
      jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
        return {
          __esModule: true,
          default: jest.fn().mockImplementation(() => mockRootHandler)
        };
      });
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      const result = app._resolveHelper("testHelper", "./test/path.js");
      
      expect(result).toBe(mockHelper);
    });

    it("should return empty object when helper not found in namespace", () => {
      // Remove module to simulate non-CommonJS environment
      delete global.module;
      const mockRootHandler = {
        root: {},
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: {}, // No helpers available
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const BaseBootstrapApp = require("../../bootstrap/base-bootstrap-app.js").default;
      jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
        return {
          __esModule: true,
          default: jest.fn().mockImplementation(() => mockRootHandler)
        };
      });
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      const result = app._resolveHelper("nonExistentHelper", "./test/path.js");
      
      expect(result).toEqual({});
    });
  });

  describe("properties", () => {
    it("should set rootHandler from options", () => {
      const mockRootHandler = {
        root: { document: {} },
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: {},
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.rootHandler).toBe(mockRootHandler);
    });

    it("should set globalRoot from rootHandler", () => {
      const expectedRoot = { document: {} };
      const mockRootHandler = {
        root: expectedRoot,
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: {},
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.globalRoot).toBe(expectedRoot);
    });

    it("should set bootstrapNamespace from rootHandler", () => {
      const expectedNamespace = { someProperty: "value" };
      const mockRootHandler = {
        root: { document: {} },
        getNamespace: jest.fn().mockReturnValue(expectedNamespace),
        helpers: {},
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.bootstrapNamespace).toBe(expectedNamespace);
    });

    it("should set helpersNamespace from rootHandler", () => {
      const expectedHelpers = { helper1: {}, helper2: {} };
      const mockRootHandler = {
        root: { document: {} },
        getNamespace: jest.fn().mockReturnValue({}),
        helpers: expectedHelpers,
        getDocument: jest.fn().mockReturnValue({}),
        getFetch: jest.fn().mockReturnValue(jest.fn()),
      };
      
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      expect(app.helpersNamespace).toBe(expectedHelpers);
    });
  });
});