import GlobalRootHandler from "../../bootstrap/constants/global-root-handler.js";

describe("GlobalRootHandler", () => {
  let globalRootHandler: any;

  beforeEach(() => {
    // Create a new instance of GlobalRootHandler for each test
    globalRootHandler = new GlobalRootHandler();
  });

  describe("constructor", () => {
    it("should initialize with default root", () => {
      expect(globalRootHandler.root).toBeDefined();
      // The root should be global, globalThis, or window depending on environment
      expect(globalRootHandler.root).toBeDefined();
    });

    it("should accept custom root handler options", () => {
      const customRoot = { custom: "root" };
      const customHandler = new GlobalRootHandler({ root: customRoot });
      expect(customHandler.root).toBe(customRoot);
    });
  });

  describe("getNamespace method", () => {
    it("should return the bootstrap namespace", () => {
      const namespace = globalRootHandler.getNamespace();
      expect(namespace).toBeDefined();
      expect(typeof namespace).toBe("object");
    });

    it("should create a new namespace if one doesn't exist", () => {
      // Access namespace multiple times and verify it's the same instance
      const namespace1 = globalRootHandler.getNamespace();
      const namespace2 = globalRootHandler.getNamespace();
      
      expect(namespace1).toBe(namespace2);
    });
  });

  describe("getDocument method", () => {
    it("should return document from window if available", () => {
      // Mock window with document
      const originalWindow = global.window;
      global.window = { document: { title: "Test" } } as any;
      
      const document = globalRootHandler.getDocument();
      expect(document).toBe(global.window.document);
      
      // Restore original window
      global.window = originalWindow;
    });

    it("should return document from root if window is not available", () => {
      // Mock root with document
      const customRoot = { document: { title: "Custom" } };
      const customHandler = new GlobalRootHandler({ root: customRoot });
      
      const document = customHandler.getDocument();
      expect(document).toBe(customRoot.document);
    });

    it("should return undefined if no document is available", () => {
      // Mock root without document
      const customRoot = {};
      const customHandler = new GlobalRootHandler({ root: customRoot });
      
      const document = customHandler.getDocument();
      expect(document).toBeUndefined();
    });
  });

  describe("hasWindow method", () => {
    it("should return true if window is available", () => {
      // Mock window
      const originalWindow = global.window;
      global.window = { document: {} } as any;
      
      const hasWindow = globalRootHandler.hasWindow();
      expect(hasWindow).toBe(true);
      
      // Restore original window
      global.window = originalWindow;
    });

    it("should return false if window is not available", () => {
      // Temporarily remove window
      const originalWindow = global.window;
      global.window = undefined as any;
      
      const hasWindow = globalRootHandler.hasWindow();
      expect(hasWindow).toBe(false);
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe("hasDocument method", () => {
    it("should return true if document is available", () => {
      // Mock window with document
      const originalWindow = global.window;
      global.window = { document: {} } as any;
      
      const hasDocument = globalRootHandler.hasDocument();
      expect(hasDocument).toBe(true);
      
      // Restore original window
      global.window = originalWindow;
    });

    it("should return false if document is not available", () => {
      // Temporarily remove document
      const originalWindow = global.window;
      global.window = { document: null } as any;
      
      const hasDocument = globalRootHandler.hasDocument();
      expect(hasDocument).toBe(false);
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe("getFetch method", () => {
    it("should return fetch from window if available", () => {
      const mockFetch = jest.fn();
      // Mock window with fetch
      const originalWindow = global.window;
      global.window = { fetch: mockFetch } as any;
      
      const fetch = globalRootHandler.getFetch();
      expect(fetch).toBe(mockFetch);
      
      // Restore original window
      global.window = originalWindow;
    });

    it("should return fetch from global if window is not available", () => {
      // Mock global with fetch
      const originalGlobal = global.global;
      const mockFetch = jest.fn();
      global.global = { fetch: mockFetch } as any;
      
      const fetch = globalRootHandler.getFetch();
      expect(fetch).toBe(mockFetch);
      
      // Restore original global
      global.global = originalGlobal;
    });

    it("should return undefined if fetch is not available", () => {
      // Temporarily remove fetch from both window and global
      const originalWindow = global.window;
      const originalGlobal = global.global;
      global.window = {} as any;
      global.global = {} as any;
      
      const fetch = globalRootHandler.getFetch();
      expect(fetch).toBeUndefined();
      
      // Restore originals
      global.window = originalWindow;
      global.global = originalGlobal;
    });
  });

  describe("getLogger method", () => {
    it("should return a logger function with the given tag", () => {
      const logger = globalRootHandler.getLogger("testTag");
      expect(logger).toBeDefined();
      expect(typeof logger).toBe("function");
    });

    it("should log with the correct tag format", () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const logger = globalRootHandler.getLogger("testTag");
      
      logger("test message");
      
      expect(consoleSpy).toHaveBeenCalledWith("[testTag]", "test message");
      
      consoleSpy.mockRestore();
    });
  });

  describe("getRoot method", () => {
    it("should return the root object", () => {
      const root = globalRootHandler.getRoot();
      expect(root).toBeDefined();
      expect(root).toBe(globalRootHandler.root);
    });
  });
});