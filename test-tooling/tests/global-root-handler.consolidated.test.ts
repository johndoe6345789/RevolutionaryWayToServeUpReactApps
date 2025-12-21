import GlobalRootHandler from '../../bootstrap/constants/global-root-handler.js';

describe('GlobalRootHandler', () => {
  let originalGlobalThis;
  let originalGlobal;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    // Store original values
    originalGlobalThis = global.globalThis;
    originalGlobal = global.global;
    originalWindow = global.window;
    originalDocument = global.document;

    // Clean up any existing bootstrap namespace
    if (global.__rwtraBootstrap) {
      delete global.__rwtraBootstrap;
    }
  });

  afterEach(() => {
    // Restore original values
    global.globalThis = originalGlobalThis;
    global.global = originalGlobal;
    global.window = originalWindow;
    global.document = originalDocument;

    // Clean up bootstrap namespace
    if (global.__rwtraBootstrap) {
      delete global.__rwtraBootstrap;
    }
  });

  describe('constructor', () => {
    it('should initialize with provided root', () => {
      const mockRoot = { custom: 'root' };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler._root).toBe(mockRoot);
      expect(handler._namespace).toBeNull();
    });

    it('should initialize with undefined root if none provided', () => {
      const handler = new GlobalRootHandler();

      expect(handler._root).toBeUndefined();
      expect(handler._namespace).toBeNull();
    });

    it('should initialize namespace to null', () => {
      const handler = new GlobalRootHandler();

      expect(handler._namespace).toBeNull();
    });
  });

  describe('_ensureRoot method', () => {
    it('should return provided root if available', () => {
      const mockRoot = { custom: 'root' };
      const handler = new GlobalRootHandler(mockRoot);

      const root = handler._ensureRoot();

      expect(root).toBe(mockRoot);
      expect(handler._root).toBe(mockRoot);
    });

    it('should detect the appropriate global as root when no root provided', () => {
      const handler = new GlobalRootHandler();

      const root = handler._ensureRoot();

      // Should detect globalThis, global, or window depending on environment
      expect(root).toBeDefined();
      expect(handler._root).toBe(root);
    });

    it('should cache the detected root', () => {
      const handler = new GlobalRootHandler();

      const firstCall = handler._ensureRoot();
      const secondCall = handler._ensureRoot();

      expect(firstCall).toBe(secondCall);
      expect(handler._root).toBe(firstCall);
    });
  });

  describe('_detectGlobal method', () => {
    it('should return globalThis if available', () => {
      global.globalThis = { test: 'globalThis' };
      delete global.global;
      delete global.window;

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.globalThis);
    });

    it('should return global if globalThis not available', () => {
      delete global.globalThis;
      global.global = { test: 'global' };
      delete global.window;

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.global);
    });

    it('should return window if globalThis and global not available', () => {
      delete global.globalThis;
      delete global.global;
      global.window = { test: 'window' };

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.window);
    });

    it('should return this if no global objects available', () => {
      delete global.globalThis;
      delete global.global;
      delete global.window;

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(handler);
    });
  });

  describe('root getter', () => {
    it('should return the detected root', () => {
      const handler = new GlobalRootHandler();

      const root = handler.root;

      expect(root).toBeDefined();
    });

    it('should return the provided root', () => {
      const mockRoot = { custom: 'provided' };
      const handler = new GlobalRootHandler(mockRoot);

      const root = handler.root;

      expect(root).toBe(mockRoot);
    });
  });

  describe('getNamespace method', () => {
    it('should create a new namespace if one does not exist', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    it('should reuse existing namespace if available', () => {
      const existingNamespace = { existing: 'value' };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toBe(existingNamespace);
    });

    it('should create namespace on the root object', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
      expect(namespace).toEqual({});
    });

    it('should cache the namespace after first access', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const firstCall = handler.getNamespace();
      const secondCall = handler.getNamespace();

      expect(firstCall).toBe(secondCall);
      expect(handler._namespace).toBe(firstCall);
    });
  });

  describe('helpers getter', () => {
    it('should create helpers namespace if it does not exist', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toEqual({});
      expect(handler.getNamespace().helpers).toBe(helpers);
    });

    it('should reuse existing helpers namespace if available', () => {
      const existingHelpers = { existing: 'helper' };
      const mockRoot = { __rwtraBootstrap: { helpers: existingHelpers } };
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toBe(existingHelpers);
    });

    it('should return helpers from the namespace', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;
      const namespace = handler.getNamespace();

      expect(helpers).toBe(namespace.helpers);
    });
  });

  describe('getDocument method', () => {
    it('should return document from root', () => {
      const mockRoot = { document: { title: 'test' } };
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBe(mockRoot.document);
    });

    it('should return undefined if no document available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBeUndefined();
    });
  });

  describe('getFetch method', () => {
    it('should return bound fetch function if available', () => {
      const calls = [];
      const mockFetch = (...args) => calls.push(args);
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);

      const fetchFn = handler.getFetch();

      expect(typeof fetchFn).toBe('function');
      // Test that the function is bound to the root
      fetchFn('test');
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('test');
    });

    it('should return undefined if no fetch available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const fetchFn = handler.getFetch();

      expect(fetchFn).toBeUndefined();
    });
  });

  describe('getLogger method', () => {
    it('should return a logging function with the provided tag', () => {
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('test-tag');

      expect(typeof logger).toBe('function');
    });

    it('should use default tag when none provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger();
      logger('test message');

      expect(consoleSpy).toHaveBeenCalledWith('rwtra', 'test message', '');
      consoleSpy.mockRestore();
    });

    it('should write to console.error with the tag', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('testTag');
      logger('test message');

      expect(consoleSpy).toHaveBeenCalledWith('testTag', 'test message', '');
      consoleSpy.mockRestore();
    });

    it('should include data in the log when provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('testTag');
      logger('test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalledWith('testTag', 'test message', { key: 'value' });
      consoleSpy.mockRestore();
    });

    it('should handle missing console gracefully', () => {
      const originalConsole = global.console;
      global.console = undefined;

      const handler = new GlobalRootHandler();
      const logger = handler.getLogger('test-tag');

      // Should not throw
      expect(() => logger('test message', { data: 'value' })).not.toThrow();

      global.console = originalConsole;
    });
  });

  describe('hasWindow method', () => {
    it('should return true if global window is available', () => {
      global.window = { document: {} };
      const handler = new GlobalRootHandler();

      const result = handler.hasWindow();

      expect(result).toBe(true);
    });

    it('should return false if global window is not available', () => {
      delete global.window;
      const handler = new GlobalRootHandler();

      const result = handler.hasWindow();

      expect(result).toBe(false);
    });
  });

  describe('hasDocument method', () => {
    it('should return true if global document is available', () => {
      global.document = { title: 'test' };
      const handler = new GlobalRootHandler();

      const result = handler.hasDocument();

      expect(result).toBe(true);
    });

    it('should return false if global document is not available', () => {
      delete global.document;
      const handler = new GlobalRootHandler();

      const result = handler.hasDocument();

      expect(result).toBe(false);
    });
  });

  describe('integration', () => {
    it('should properly set up namespace with helpers', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();
      const helpers = handler.helpers;

      expect(namespace).toEqual({ helpers: {} });
      expect(helpers).toEqual({});
      expect(namespace.helpers).toBe(helpers);
    });

    it('should work with different root objects', () => {
      const root1 = { test: 'value1' };
      const root2 = { test: 'value2' };

      const handler1 = new GlobalRootHandler(root1);
      const handler2 = new GlobalRootHandler(root2);

      const namespace1 = handler1.getNamespace();
      const namespace2 = handler2.getNamespace();

      expect(namespace1).toEqual({});
      expect(namespace2).toEqual({});
      expect(namespace1).not.toBe(namespace2);
      expect(root1.__rwtraBootstrap).toBe(namespace1);
      expect(root2.__rwtraBootstrap).toBe(namespace2);
    });
  });
});