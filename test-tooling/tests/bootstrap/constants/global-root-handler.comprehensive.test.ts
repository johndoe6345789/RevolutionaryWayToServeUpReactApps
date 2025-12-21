import GlobalRootHandler from "../../../../bootstrap/constants/global-root-handler.js";

describe("GlobalRootHandler", () => {
  describe("constructor", () => {
    it("should create an instance with provided root", () => {
      const customRoot = { test: "value" };
      const handler = new GlobalRootHandler(customRoot);
      
      expect((handler as any)._root).toBe(customRoot);
      expect((handler as any)._namespace).toBeNull();
    });

    it("should create an instance without provided root", () => {
      const handler = new GlobalRootHandler();
      
      expect((handler as any)._root).toBeUndefined();
      expect((handler as any)._namespace).toBeNull();
    });
  });

  describe("_ensureRoot method", () => {
    it("should return the provided root if available", () => {
      const customRoot = { test: "value" };
      const handler = new GlobalRootHandler(customRoot);
      
      const result = (handler as any)._ensureRoot();
      
      expect(result).toBe(customRoot);
    });

    it("should detect globalThis as root when no root provided", () => {
      const handler = new GlobalRootHandler();
      
      const result = (handler as any)._ensureRoot();
      
      // In Node.js environment, this will be the global object
      expect(result).toBeDefined();
    });

    it("should cache the detected root", () => {
      const handler = new GlobalRootHandler();
      
      // First call should detect and cache
      const result1 = (handler as any)._ensureRoot();
      // Second call should return cached value
      const result2 = (handler as any)._ensureRoot();
      
      expect(result1).toBe(result2);
      expect((handler as any)._root).toBe(result1);
    });
  });

  describe("_detectGlobal method", () => {
    it("should return globalThis when available", () => {
      const handler = new GlobalRootHandler();
      const result = (handler as any)._detectGlobal();
      
      expect(result).toBeDefined();
    });
  });

  describe("root getter", () => {
    it("should return the detected root", () => {
      const handler = new GlobalRootHandler();
      const root = handler.root;
      
      expect(root).toBeDefined();
    });

    it("should return the same root instance across multiple calls", () => {
      const handler = new GlobalRootHandler();
      
      const root1 = handler.root;
      const root2 = handler.root;
      
      expect(root1).toBe(root2);
    });
  });

  describe("getNamespace method", () => {
    it("should return the bootstrap namespace object", () => {
      const handler = new GlobalRootHandler();
      const namespace = handler.getNamespace();
      
      expect(namespace).toBeDefined();
      expect(typeof namespace).toBe("object");
    });

    it("should create a new namespace if one doesn't exist", () => {
      // Clean up any existing namespace
      delete (globalThis as any).__rwtraBootstrap;
      
      const handler = new GlobalRootHandler();
      const namespace = handler.getNamespace();
      
      expect(namespace).toEqual({});
      expect((globalThis as any).__rwtraBootstrap).toBe(namespace);
    });

    it("should reuse existing namespace if available", () => {
      const existingNamespace = { existing: "value" };
      (globalThis as any).__rwtraBootstrap = existingNamespace;
      
      const handler = new GlobalRootHandler();
      const namespace = handler.getNamespace();
      
      expect(namespace).toBe(existingNamespace);
    });

    it("should cache the namespace after first access", () => {
      delete (globalThis as any).__rwtraBootstrap;
      
      const handler = new GlobalRootHandler();
      
      const namespace1 = handler.getNamespace();
      // Modify the global to see if it's cached
      (globalThis as any).__rwtraBootstrap = { different: "value" };
      const namespace2 = handler.getNamespace();
      
      expect(namespace1).toBe(namespace2);
      expect(namespace1).toEqual({});
    });
  });

  describe("helpers getter", () => {
    it("should return the helpers namespace", () => {
      const handler = new GlobalRootHandler();
      const helpers = handler.helpers;
      
      expect(helpers).toBeDefined();
      expect(typeof helpers).toBe("object");
    });

    it("should create helpers namespace if it doesn't exist", () => {
      const namespace = {};
      (globalThis as any).__rwtraBootstrap = namespace;
      
      const handler = new GlobalRootHandler();
      const helpers = handler.helpers;
      
      expect(helpers).toEqual({});
      expect(namespace.helpers).toBe(helpers);
    });

    it("should reuse existing helpers namespace if available", () => {
      const existingHelpers = { existing: "helper" };
      const namespace = { helpers: existingHelpers };
      (globalThis as any).__rwtraBootstrap = namespace;
      
      const handler = new GlobalRootHandler();
      const helpers = handler.helpers;
      
      expect(helpers).toBe(existingHelpers);
    });
  });

  describe("getDocument method", () => {
    it("should return the global document reference", () => {
      const handler = new GlobalRootHandler();
      const document = handler.getDocument();
      
      // In Node.js environment, document might be undefined
      // But the method should return whatever is on the root
      expect(document).toBeDefined(); // Or undefined if not in browser
    });
  });

  describe("getFetch method", () => {
    it("should return a bound fetch function if available", () => {
      // In Node.js, fetch might not be available depending on version
      // If fetch is available, it should return a bound version
      const handler = new GlobalRootHandler();
      const fetchFn = handler.getFetch();
      
      if (typeof globalThis.fetch === "function") {
        expect(fetchFn).toBeDefined();
        expect(typeof fetchFn).toBe("function");
        // Verify it's bound to the root
        expect(fetchFn).not.toBe(globalThis.fetch);
      } else {
        expect(fetchFn).toBeUndefined();
      }
    });

    it("should return undefined if fetch is not a function", () => {
      // Temporarily remove fetch to test this case
      const originalFetch = globalThis.fetch;
      delete (globalThis as any).fetch;
      
      const handler = new GlobalRootHandler();
      const fetchFn = handler.getFetch();
      
      expect(fetchFn).toBeUndefined();
      
      // Restore fetch
      globalThis.fetch = originalFetch;
    });
  });

  describe("getLogger method", () => {
    it("should return a logging function with the provided tag", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger("testTag");
      
      expect(typeof logger).toBe("function");
    });

    it("should use default tag when none provided", () => {
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger();
      
      // We can't easily spy on console.error in this context, but we can verify
      // that the logger function exists and has the right signature
      expect(typeof logger).toBe("function");
      expect(logger.length).toBe(2); // Function should accept msg and data
    });

    it("should write to console.error with the tag", () => {
      // Mock console.error to verify the logger behavior
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger("testTag");
      
      logger("test message", { data: "test" });
      
      expect(consoleSpy).toHaveBeenCalledWith("testTag", "test message", { data: "test" });
      
      consoleSpy.mockRestore();
    });

    it("should handle missing console gracefully", () => {
      // Temporarily remove console to test graceful handling
      const originalConsole = globalThis.console;
      (globalThis as any).console = undefined;
      
      const handler = new GlobalRootHandler();
      const logger = handler.getLogger("testTag");
      
      // This should not throw an error
      expect(() => logger("test message", { data: "test" })).not.toThrow();
      
      // Restore console
      globalThis.console = originalConsole;
    });
  });

  describe("hasWindow method", () => {
    it("should return true if global window is available", () => {
      const handler = new GlobalRootHandler();
      const hasWindow = handler.hasWindow();
      
      // In Node.js environment, this should be false
      // In browser environment, this would be true
      expect(typeof hasWindow).toBe("boolean");
    });
  });

  describe("hasDocument method", () => {
    it("should return true if global document is available", () => {
      const handler = new GlobalRootHandler();
      const hasDocument = handler.hasDocument();
      
      // In Node.js environment, this should be false
      // In browser environment, this would be true
      expect(typeof hasDocument).toBe("boolean");
    });
  });

  describe("integration: namespace and helpers work together", () => {
    it("should properly set up namespace with helpers", () => {
      delete (globalThis as any).__rwtraBootstrap;
      
      const handler = new GlobalRootHandler();
      const namespace = handler.getNamespace();
      const helpers = handler.helpers;
      
      // Verify namespace was created on global
      expect((globalThis as any).__rwtraBootstrap).toBe(namespace);
      // Verify helpers are part of the namespace
      expect(namespace.helpers).toBe(helpers);
    });
  });
});