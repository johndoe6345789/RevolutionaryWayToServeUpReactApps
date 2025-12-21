import GlobalRootHandler from '../../bootstrap/constants/global-root-handler.js';

describe('GlobalRootHandler', () => {
  let originalGlobalThis;
  let originalWindow;
  let originalConsoleError;

  beforeAll(() => {
    originalGlobalThis = global.globalThis;
    originalWindow = global.window;
    originalConsoleError = global.console?.error;
  });

  afterAll(() => {
    global.globalThis = originalGlobalThis;
    global.window = originalWindow;
    if (global.console && originalConsoleError) {
      global.console.error = originalConsoleError;
    }
  });

  beforeEach(() => {
    // Clean up any bootstrap properties from previous tests
    if (global.window) {
      delete global.window.__rwtraBootstrap;
    }
    if (global.globalThis) {
      delete global.globalThis.__rwtraBootstrap;
    }
    if (global.document) {
      delete global.document.__rwtraBootstrap;
    }
    if (global.__rwtraBootstrap) {
      delete global.__rwtraBootstrap;
    }
  });

  describe('constructor', () => {
    it('should initialize with provided root', () => {
      const mockRoot = { document: {}, customProp: 'value' };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.root).toBe(mockRoot);
    });

    it('should initialize with globalThis as root when no root provided', () => {
      global.globalThis = { document: {} };
      const handler = new GlobalRootHandler();

      expect(handler.root).toBe(global.globalThis);
    });
  });

  describe('getNamespace method', () => {
    it('should create and cache the bootstrap namespace', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    it('should return the same namespace instance on subsequent calls', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace1 = handler.getNamespace();
      const namespace2 = handler.getNamespace();

      expect(namespace1).toBe(namespace2);
    });

    it('should use existing namespace if already present', () => {
      const existingNamespace = { existing: 'value' };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toBe(existingNamespace);
    });
  });

  describe('helpers getter', () => {
    it('should return helpers from the namespace', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toEqual({});
      expect(handler.getNamespace().helpers).toBe(helpers);
    });

    it('should return same helpers instance on subsequent calls', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers1 = handler.helpers;
      const helpers2 = handler.helpers;

      expect(helpers1).toBe(helpers2);
    });
  });

  describe('getDocument method', () => {
    it('should return document from root', () => {
      const mockRoot = { document: { title: 'Test' } };
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

  describe('getLogger method', () => {
    it('should return a logging function', () => {
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger();

      expect(typeof logger).toBe('function');
    });

    it('should handle missing console.error gracefully', () => {
      const originalConsole = global.console;
      global.console = {};
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('testTag');

      // Should not throw when console.error is not available
      expect(() => logger('test message')).not.toThrow();

      global.console = originalConsole;
    });
  });

  describe('hasWindow method', () => {
    it('should return true if window is available on root', () => {
      const mockRoot = { window: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasWindow()).toBe(true);
    });

    it('should return false if window is not available on root', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasWindow()).toBe(false);
    });
  });

  describe('hasDocument method', () => {
    it('should return true if document is available on root', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasDocument()).toBe(true);
    });

    it('should return false if document is not available on root', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasDocument()).toBe(false);
    });
  });

  describe('integration', () => {
    it('should work with different root objects', () => {
      const root1 = { document: {} };
      const root2 = { window: {} };

      const handler1 = new GlobalRootHandler(root1);
      const handler2 = new GlobalRootHandler(root2);

      expect(handler1.root).toBe(root1);
      expect(handler2.root).toBe(root2);

      const namespace1 = handler1.getNamespace();
      const namespace2 = handler2.getNamespace();

      expect(namespace1).not.toBe(namespace2);
      expect(namespace1).toEqual({});
      expect(namespace2).toEqual({});
    });
  });
});