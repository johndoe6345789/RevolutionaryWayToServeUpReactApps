const GlobalRootHandler = require("../../../../bootstrap/constants/global-root-handler.js");

describe("GlobalRootHandler", () => {
  describe("constructor", () => {
    test("should initialize with provided root", () => {
      const mockRoot = { test: "value" };
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler._root).toBe(mockRoot);
      expect(handler._namespace).toBeNull();
    });

    test("should initialize with null root if none provided", () => {
      const handler = new GlobalRootHandler();
      
      expect(handler._root).toBeUndefined();
      expect(handler._namespace).toBeNull();
    });

    test("should initialize namespace to null", () => {
      const handler = new GlobalRootHandler();
      
      expect(handler._namespace).toBeNull();
    });
  });

  describe("_ensureRoot method", () => {
    test("should detect global if no root provided", () => {
      const handler = new GlobalRootHandler();
      const root = handler._ensureRoot();
      
      // Should return globalThis, global, or the handler itself depending on environment
      expect(root).toBeDefined();
    });

    test("should return provided root if available", () => {
      const mockRoot = { test: "value" };
      const handler = new GlobalRootHandler(mockRoot);
      const root = handler._ensureRoot();
      
      expect(root).toBe(mockRoot);
    });

    test("should cache the detected root", () => {
      const handler = new GlobalRootHandler();
      const firstCall = handler._ensureRoot();
      const secondCall = handler._ensureRoot();
      
      expect(firstCall).toBe(secondCall);
    });
  });

  describe("_detectGlobal method", () => {
    test("should return globalThis if available", () => {
      const handler = new GlobalRootHandler();
      const globalRef = handler._detectGlobal();
      
      // In test environment, globalThis should be available
      expect(globalRef).toBeDefined();
    });
  });

  describe("root getter", () => {
    test("should return the detected root", () => {
      const handler = new GlobalRootHandler();
      const root = handler.root;
      
      expect(root).toBeDefined();
    });

    test("should return the provided root", () => {
      const mockRoot = { test: "value" };
      const handler = new GlobalRootHandler(mockRoot);
      const root = handler.root;
      
      expect(root).toBe(mockRoot);
    });
  });

  describe("getNamespace method", () => {
    test("should create and cache the bootstrap namespace", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      const namespace = handler.getNamespace();
      
      expect(namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    test("should return the same namespace instance on subsequent calls", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      const firstNamespace = handler.getNamespace();
      const secondNamespace = handler.getNamespace();
      
      expect(firstNamespace).toBe(secondNamespace);
    });

    test("should use existing namespace if already present", () => {
      const existingNamespace = { existing: "value" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const handler = new GlobalRootHandler(mockRoot);
      const namespace = handler.getNamespace();
      
      expect(namespace).toBe(existingNamespace);
    });

    test("should create namespace on provided root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      const namespace = handler.getNamespace();
      
      expect(namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(namespace).toEqual({});
    });
  });

  describe("helpers getter", () => {
    test("should return helpers from the namespace", () => {
      const mockRoot = { __rwtraBootstrap: { helpers: { test: "value" } } };
      const handler = new GlobalRootHandler(mockRoot);
      const helpers = handler.helpers;
      
      expect(helpers).toEqual({ test: "value" });
    });

    test("should create helpers if not present", () => {
      const mockRoot = { __rwtraBootstrap: {} };
      const handler = new GlobalRootHandler(mockRoot);
      const helpers = handler.helpers;
      
      expect(helpers).toEqual({});
      expect(mockRoot.__rwtraBootstrap.helpers).toBe(helpers);
    });

    test("should return same helpers instance on subsequent calls", () => {
      const mockRoot = { __rwtraBootstrap: {} };
      const handler = new GlobalRootHandler(mockRoot);
      const firstHelpers = handler.helpers;
      const secondHelpers = handler.helpers;
      
      expect(firstHelpers).toBe(secondHelpers);
    });
  });

  describe("getDocument method", () => {
    test("should return document from root", () => {
      const mockDocument = { title: "test" };
      const mockRoot = { document: mockDocument };
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.getDocument()).toBe(mockDocument);
    });

    test("should return undefined if no document available", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.getDocument()).toBeUndefined();
    });
  });

  describe("getFetch method", () => {
    test("should return bound fetch function if available", () => {
      const mockFetch = jest.fn();
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);
      const fetchFn = handler.getFetch();
      
      expect(fetchFn).toBeInstanceOf(Function);
      expect(fetchFn).not.toBe(mockFetch); // Should be bound version
    });

    test("should return undefined if no fetch available", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.getFetch()).toBeUndefined();
    });

    test("should properly bind fetch to the root", () => {
      const mockFetch = jest.fn();
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);
      const boundFetch = handler.getFetch();
      
      boundFetch();
      expect(mockFetch).toHaveBeenCalledWith();
      expect(mockFetch.mock.instances[0]).toBe(mockRoot);
    });
  });

  describe("getLogger method", () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test("should return a logging function", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger();
      
      expect(logger).toBeInstanceOf(Function);
    });

    test("should use default tag 'rwtra' if none provided", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger();
      logger("test message");
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("rwtra", "test message", "");
    });

    test("should use provided tag", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger("custom-tag");
      logger("test message");
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("custom-tag", "test message", "");
    });

    test("should include data in log if provided", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger();
      logger("test message", { detail: "value" });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("rwtra", "test message", { detail: "value" });
    });

    test("should handle missing console.error gracefully", () => {
      const originalConsole = global.console;
      global.console = { error: undefined };
      
      try {
        const handler = new GlobalRootHandler();
        const logger = handler.getLogger();
        // Should not throw
        expect(() => logger("test message")).not.toThrow();
      } finally {
        global.console = originalConsole;
      }
    });
  });

  describe("hasWindow method", () => {
    test("should return true if window is available on root", () => {
      const mockRoot = { window: {} };
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.hasWindow()).toBe(true);
    });

    test("should return false if window is not available on root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.hasWindow()).toBe(false);
    });
  });

  describe("hasDocument method", () => {
    test("should return true if document is available on root", () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.hasDocument()).toBe(true);
    });

    test("should return false if document is not available on root", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      
      expect(handler.hasDocument()).toBe(false);
    });
  });

  describe("integration", () => {
    test("should work with different root objects", () => {
      const mockRoot = { test: "value" };
      const handler = new GlobalRootHandler(mockRoot);
      
      // Test that all methods work together
      expect(handler.root).toBe(mockRoot);
      expect(handler.getNamespace()).toEqual({});
      expect(handler.helpers).toEqual({});
      expect(handler.hasWindow()).toBe(false);
      expect(handler.hasDocument()).toBe(false);
    });
  });
});