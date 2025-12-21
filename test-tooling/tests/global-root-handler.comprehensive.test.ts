import GlobalRootHandler from "../../bootstrap/constants/global-root-handler.js";

describe("GlobalRootHandler", () => {
  let originalWindow;
  let originalGlobalThis;
  let originalConsoleError;

  beforeAll(() => {
    originalWindow = global.window;
    originalGlobalThis = global.globalThis;
    originalConsoleError = console.error;
  });

  afterAll(() => {
    global.window = originalWindow;
    global.globalThis = originalGlobalThis;
    console.error = originalConsoleError;
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

  describe("constructor", () => {
    it("should initialize with provided root", () => {
      const mockRoot = { document: {}, fetch: () => {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.root).toBe(mockRoot);
    });

    it("should initialize with globalThis as root when no root provided", () => {
      global.globalThis = { document: {} };
      const handler = new GlobalRootHandler();

      expect(handler.root).toBe(global.globalThis);
    });

    it("should initialize with window as root when globalThis not available", () => {
      delete global.globalThis;
      global.window = { document: {} };
      const handler = new GlobalRootHandler();

      expect(handler.root).toBe(global.window);
    });

    it("should initialize with 'this' as root when no global objects available", () => {
      delete global.globalThis;
      delete global.window;
      const handler = new GlobalRootHandler();

      expect(handler.root).toBe(handler);
    });
  });

  describe("_ensureRoot method", () => {
    it("should return provided root if available", () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      const result = handler._ensureRoot(mockRoot);

      expect(result).toBe(mockRoot);
    });

    it("should detect global if no root provided", () => {
      global.globalThis = { document: {} };
      const handler = new GlobalRootHandler();

      const result = handler._ensureRoot();

      expect(result).toBe(global.globalThis);
    });

    it("should cache the detected root", () => {
      global.globalThis = { document: {} };
      const handler = new GlobalRootHandler();

      const result1 = handler._ensureRoot();
      const result2 = handler._ensureRoot();

      expect(result1).toBe(result2);
    });
  });

  describe("_detectGlobal method", () => {
    it("should return globalThis if available", () => {
      global.globalThis = { document: {} };
      delete global.window;
      
      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.globalThis);
    });

    it("should return window if globalThis not available", () => {
      delete global.globalThis;
      global.window = { document: {} };
      
      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.window);
    });

    it("should return 'this' if no global objects available", () => {
      delete global.globalThis;
      delete global.window;
      
      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(handler);
    });
  });

  describe("root getter", () => {
    it("should return the detected root", () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.root).toBe(mockRoot);
    });

    it("should return the provided root", () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.root).toBe(mockRoot);
    });
  });

  describe("getNamespace method", () => {
    it("should create and cache the bootstrap namespace", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    it("should return the same namespace instance on subsequent calls", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace1 = handler.getNamespace();
      const namespace2 = handler.getNamespace();

      expect(namespace1).toBe(namespace2);
    });

    it("should use existing namespace if already present", () => {
      const existingNamespace = { existing: "value" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toBe(existingNamespace);
    });

    it("should create namespace on provided root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      handler.getNamespace();

      expect(mockRoot.__rwtraBootstrap).toBeDefined();
    });
  });

  describe("helpers getter", () => {
    it("should return helpers from the namespace", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      const namespace = handler.getNamespace();

      const helpers = handler.helpers;
      const helpersFromNamespace = namespace.helpers;

      expect(helpers).toBe(helpersFromNamespace);
    });

    it("should create helpers if not present", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toEqual({});
    });

    it("should return same helpers instance on subsequent calls", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers1 = handler.helpers;
      const helpers2 = handler.helpers;

      expect(helpers1).toBe(helpers2);
    });
  });

  describe("getDocument method", () => {
    it("should return document from root", () => {
      const mockRoot = { document: { title: "Test" } };
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBe(mockRoot.document);
    });

    it("should return undefined if no document available", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBeUndefined();
    });
  });

  describe("getFetch method", () => {
    it("should return bound fetch function if available", () => {
      const mockFetch = jest.fn();
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      expect(fetch).toBe(mockFetch);
    });

    it("should return undefined if no fetch available", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      expect(fetch).toBeUndefined();
    });

    it("should properly bind fetch to the root", () => {
      const mockRoot = { fetch: jest.fn() };
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      // Test that fetch is properly bound to the root context
      if (fetch) {
        fetch("test");
        expect(mockRoot.fetch).toHaveBeenCalledWith("test");
      }
    });
  });

  describe("getLogger method", () => {
    it("should return a logging function", () => {
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger();

      expect(typeof logger).toBe("function");
    });

    it("should use default tag 'rwtra' if none provided", () => {
      console.error = jest.fn();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger();
      logger("test message");

      expect(console.error).toHaveBeenCalledWith("[rwtra]", "test message");
    });

    it("should use provided tag", () => {
      console.error = jest.fn();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger("customTag");
      logger("test message");

      expect(console.error).toHaveBeenCalledWith("[customTag]", "test message");
    });

    it("should include data in log if provided", () => {
      console.error = jest.fn();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger("testTag");
      logger("test message", { key: "value" });

      expect(console.error).toHaveBeenCalledWith("[testTag]", "test message", { key: "value" });
    });

    it("should handle missing console.error gracefully", () => {
      const originalConsole = global.console;
      global.console = {};
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger("testTag");

      // Should not throw when console.error is not available
      expect(() => logger("test message")).not.toThrow();

      global.console = originalConsole;
    });
  });

  describe("hasWindow method", () => {
    it("should return true if window is available on root", () => {
      const mockRoot = { window: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasWindow()).toBe(true);
    });

    it("should return false if window is not available on root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasWindow()).toBe(false);
    });

    it("should return true if root is the global window object", () => {
      global.window = { document: {} };
      const handler = new GlobalRootHandler(global.window);

      expect(handler.hasWindow()).toBe(true);
    });
  });

  describe("hasDocument method", () => {
    it("should return true if document is available on root", () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasDocument()).toBe(true);
    });

    it("should return false if document is not available on root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.hasDocument()).toBe(false);
    });
  });

  describe("integration", () => {
    it("should work with different root objects", () => {
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