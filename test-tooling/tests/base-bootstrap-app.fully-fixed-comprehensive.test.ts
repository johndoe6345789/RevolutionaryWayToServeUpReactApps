import BaseBootstrapApp from '../../bootstrap/base-bootstrap-app.js';
import GlobalRootHandler from '../../bootstrap/constants/global-root-handler.js';

// Create a mock GlobalRootHandler to avoid issues with require calls
class MockGlobalRootHandler extends GlobalRootHandler {
  constructor(root = null) {
    // Call the parent constructor with a minimal root
    super(root || {});
  }
}

describe('BaseBootstrapApp', () => {
  let originalModule;
  let originalRequire;
  let originalWindow;
  let originalGlobalThis;
  let originalDocument;

  beforeEach(() => {
    // Store original values
    originalModule = global.module;
    originalRequire = global.require;
    originalWindow = global.window;
    originalGlobalThis = global.globalThis;
    originalDocument = global.document;

    // Clean up any existing bootstrap namespace
    delete global.__rwtraBootstrap;
  });

  afterEach(() => {
    // Restore original values
    global.module = originalModule;
    global.require = originalRequire;
    global.window = originalWindow;
    global.globalThis = originalGlobalThis;
    global.document = originalDocument;

    // Clean up bootstrap namespace
    delete global.__rwtraBootstrap;
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const app = new BaseBootstrapApp();

      expect(app.rootHandler).toBeInstanceOf(GlobalRootHandler);
      expect(app.globalRoot).toBeDefined();
      // The namespace includes helpers by default
      expect(app.bootstrapNamespace).toBeDefined();
      expect(app.helpersNamespace).toBeDefined();
      expect(typeof app.isCommonJs).toBe('boolean');
    });

    it('should initialize with custom rootHandler', () => {
      const mockRootHandler = new MockGlobalRootHandler({ custom: 'root' });
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.rootHandler).toBe(mockRootHandler);
      expect(app.globalRoot).toBeDefined();
    });

    it('should set isCommonJs to true when global.module exists', () => {
      global.module = { exports: {} };

      const app = new BaseBootstrapApp();

      expect(app.isCommonJs).toBe(true);
    });

    it('should set isCommonJs to false when global.module does not exist', () => {
      delete global.module;

      const app = new BaseBootstrapApp();

      expect(app.isCommonJs).toBe(false);
    });
  });

  describe('static isBrowser method', () => {
    it('should return true when passed window object has document', () => {
      const mockWindow = { document: {} };

      const result = BaseBootstrapApp.isBrowser(mockWindow);

      expect(result).toBe(true);
    });

    it('should return false when passed window object has no document', () => {
      const mockWindow = {};

      const result = BaseBootstrapApp.isBrowser(mockWindow);

      expect(result).toBe(false);
    });

    it('should return true when global window has document', () => {
      global.window = { document: {} };

      const result = BaseBootstrapApp.isBrowser();

      expect(result).toBe(true);
    });

    it('should return false when global window has no document', () => {
      global.window = {};

      const result = BaseBootstrapApp.isBrowser();

      expect(result).toBe(false);
    });

    it('should return true when global globalThis has document', () => {
      delete global.window;
      global.globalThis = { document: {} };

      const result = BaseBootstrapApp.isBrowser();

      expect(result).toBe(true);
    });

    it('should return false when global globalThis has no document', () => {
      delete global.window;
      global.globalThis = {};

      const result = BaseBootstrapApp.isBrowser();

      expect(result).toBe(false);
    });

    it('should return false when no window object is available', () => {
      delete global.window;
      delete global.globalThis;

      const result = BaseBootstrapApp.isBrowser();

      expect(result).toBe(false);
    });

    it('should prioritize passed window over global window', () => {
      global.window = { document: {} }; // Global has document
      const mockWindow = {}; // Passed window has no document

      const result = BaseBootstrapApp.isBrowser(mockWindow);

      expect(result).toBe(false); // Should use passed window, which has no document
    });
  });

  describe('_resolveHelper method', () => {
    it('should resolve helpers via require when in CommonJS', () => {
      // Set up CommonJS environment
      global.module = { exports: {} };
      
      // Create a mock require function to spy on calls
      const mockRequire = jest.fn().mockReturnValue({ test: 'helper' });
      global.require = mockRequire;
      
      const mockRootHandler = new MockGlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      // Call the method - this should trigger require if in CommonJS
      const result = app._resolveHelper('testHelper', './path/to/helper');

      // Verify that require was called with the correct path
      expect(mockRequire).toHaveBeenCalledWith('./path/to/helper');
      expect(result).toEqual({ test: 'helper' });
    });

    it('should resolve helpers from namespace when not in CommonJS', () => {
      delete global.module;
      const mockHelper = { name: 'testHelper' };
      const mockRootHandler = new MockGlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      // Add helper to the namespace
      app.helpersNamespace.testHelper = mockHelper;

      const result = app._resolveHelper('testHelper', './path/to/helper');

      expect(result).toBe(mockHelper);
    });

    it('should return empty object when helper not found in namespace', () => {
      delete global.module;
      const mockRootHandler = new MockGlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      const result = app._resolveHelper('nonExistentHelper', './path/to/helper');

      expect(result).toEqual({});
    });
  });

  describe('properties', () => {
    it('should set rootHandler from options', () => {
      const mockRootHandler = new MockGlobalRootHandler({ custom: 'root' });
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.rootHandler).toBe(mockRootHandler);
    });

    it('should set globalRoot from rootHandler', () => {
      const mockRoot = { document: {} };
      const mockRootHandler = new MockGlobalRootHandler(mockRoot);
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.globalRoot).toBe(mockRoot);
    });

    it('should set bootstrapNamespace from rootHandler', () => {
      const mockRoot = {};
      const mockRootHandler = new MockGlobalRootHandler(mockRoot);
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.bootstrapNamespace).toBe(mockRootHandler.getNamespace());
    });

    it('should set helpersNamespace from rootHandler', () => {
      const mockRoot = {};
      const mockRootHandler = new MockGlobalRootHandler(mockRoot);
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.helpersNamespace).toBe(mockRootHandler.helpers);
    });
  });

  describe('integration', () => {
    it('should work with CommonJS environment', () => {
      global.module = { exports: {} };
      const app = new BaseBootstrapApp();

      expect(app.isCommonJs).toBe(true);
    });

    it('should work with non-CommonJS environment', () => {
      delete global.module;
      const app = new BaseBootstrapApp();

      expect(app.isCommonJs).toBe(false);
    });

    it('should handle different root handler configurations', () => {
      const mockRoot = { custom: 'value' };
      const mockRootHandler = new MockGlobalRootHandler(mockRoot);
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      expect(app.rootHandler).toBe(mockRootHandler);
      expect(app.globalRoot).toBe(mockRoot);
    });
  });
});