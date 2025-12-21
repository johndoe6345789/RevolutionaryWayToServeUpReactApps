import ScriptListLoader from "../../../../../bootstrap/services/core/script-list-loader-service.js";
import ScriptListLoaderConfig from "../../../../../bootstrap/configs/core/script-list-loader.js";

// Mock document object for testing
class MockDocument {
  constructor() {
    this.head = new MockElement('head');
    this.documentElement = new MockElement('html');
    this.createElementCalls = [];
  }

  createElement(tag) {
    this.createElementCalls.push(tag);
    return new MockElement(tag);
  }

  querySelector(selector) {
    if (selector === 'head') return this.head;
    return null;
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.innerHTML = '';

    // Special handling for template elements
    if (tagName === 'template') {
      this.content = {
        querySelectorAll: (selector) => {
          if (selector === 'script[src]') {
            // Return mock script elements for testing
            const mockScript1 = { getAttribute: () => 'script1.js' };
            const mockScript2 = { getAttribute: () => 'script2.js' };
            return [mockScript1, mockScript2];
          }
          return [];
        }
      };
    } else {
      this.content = null;
    }
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  appendChild(child) {
    this.children.push(child);
  }

  querySelectorAll(selector) {
    // Mock implementation for the template scenario
    if (selector === 'script[src]') {
      // Return an empty array since we're mocking
      return [];
    }
    return [];
  }
}

// Mock fetch implementation
const mockFetch = (url, options) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('<script src="test.js"></script>')
  });
};

// Mock GlobalRootHandler for testing
class MockGlobalRootHandler {
  getDocument() {
    return new MockDocument();
  }

  getFetch() {
    return mockFetch;
  }

  getLogger(tag) {
    return (msg, data) => {};
  }
}

describe("ScriptListLoader", () => {
  let scriptListLoader;
  let mockDocument;
  let mockConfig;

  beforeEach(() => {
    mockDocument = new MockDocument();
    mockConfig = new ScriptListLoaderConfig({
      document: mockDocument,
      fetch: mockFetch,
      rootHandler: new MockGlobalRootHandler()
    });
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      scriptListLoader = new ScriptListLoader(mockConfig);

      expect(scriptListLoader.config).toBe(mockConfig);
      expect(scriptListLoader.initialized).toBe(false);
    });

    it("should normalize config when a plain object is provided", () => {
      const plainConfig = {
        document: mockDocument,
        fetch: mockFetch
      };

      scriptListLoader = new ScriptListLoader(plainConfig);

      expect(scriptListLoader.config).toBeInstanceOf(ScriptListLoaderConfig);
      expect(scriptListLoader.config.document).toBe(mockDocument);
    });

    it("should use GlobalRootHandler when none is provided in config", () => {
      scriptListLoader = new ScriptListLoader({
        document: mockDocument,
        fetch: mockFetch
      });

      expect(scriptListLoader.rootHandler).toBeDefined();
    });

    it("should use provided rootHandler when available in config", () => {
      const mockHandler = new MockGlobalRootHandler();
      scriptListLoader = new ScriptListLoader({
        document: mockDocument,
        fetch: mockFetch,
        rootHandler: mockHandler
      });

      expect(scriptListLoader.rootHandler).toBe(mockHandler);
    });
  });

  describe("initialize method", () => {
    beforeEach(() => {
      scriptListLoader = new ScriptListLoader(mockConfig);
    });

    it("should mark the instance as initialized", () => {
      expect(scriptListLoader.initialized).toBe(false);
      scriptListLoader.initialize();
      expect(scriptListLoader.initialized).toBe(true);
    });

    it("should set up internal properties from config", () => {
      scriptListLoader.initialize();

      expect(scriptListLoader.document).toBe(mockConfig.document);
      expect(scriptListLoader.manifestUrl).toBe(mockConfig.manifestUrl);
      expect(scriptListLoader.fetchImpl).toBe(mockConfig.fetch);
      expect(scriptListLoader.log).toBe(mockConfig.log);
    });

    it("should prevent double initialization", () => {
      scriptListLoader.initialize();

      expect(() => scriptListLoader.initialize()).toThrow("ScriptListLoader already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = scriptListLoader.initialize();
      expect(result).toBe(scriptListLoader);
    });
  });

  describe("loadScript method", () => {
    beforeEach(() => {
      scriptListLoader = new ScriptListLoader(mockConfig);
      scriptListLoader.initialize();
    });

    it("should throw an error when document is unavailable", async () => {
      scriptListLoader.document = null;

      await expect(scriptListLoader.loadScript("test.js")).rejects.toThrow("Document is unavailable when loading scripts");
    });

    it("should create and append a script element to the document", async () => {
      const mockScriptElement = new MockElement("script");
      const originalCreateElement = mockDocument.createElement;
      mockDocument.createElement = (tag) => {
        if (tag === "script") return mockScriptElement;
        return originalCreateElement.call(mockDocument, tag);
      };

      // Mock the appendChild method to track calls
      const appendChildSpy = jest.fn();
      mockDocument.head.appendChild = appendChildSpy;

      // Execute the test
      const promise = scriptListLoader.loadScript("test.js");

      // Simulate onload
      mockScriptElement.onload();

      await promise;

      expect(appendChildSpy).toHaveBeenCalledWith(mockScriptElement);
      expect(mockScriptElement.src).toBe("test.js");
      expect(mockScriptElement.async).toBe(false);
    });

    it("should reject when script fails to load", async () => {
      const mockScriptElement = new MockElement("script");
      mockDocument.createElement = () => mockScriptElement;

      const promise = scriptListLoader.loadScript("test.js");

      // Simulate onerror
      mockScriptElement.onerror();

      await expect(promise).rejects.toThrow("Failed to load test.js");
    });

    it("should append script to documentElement if head is not available", async () => {
      mockDocument.head = null;
      const mockScriptElement = new MockElement("script");
      const originalCreateElement = mockDocument.createElement;
      mockDocument.createElement = (tag) => {
        if (tag === "script") return mockScriptElement;
        return originalCreateElement.call(mockDocument, tag);
      };

      // Mock the appendChild method to track calls
      const appendChildSpy = jest.fn();
      mockDocument.documentElement.appendChild = appendChildSpy;

      const promise = scriptListLoader.loadScript("test.js");
      mockScriptElement.onload();
      await promise;

      expect(appendChildSpy).toHaveBeenCalledWith(mockScriptElement);
    });
  });

  describe("loadFromManifest method", () => {
    beforeEach(() => {
      scriptListLoader = new ScriptListLoader(mockConfig);
      scriptListLoader.initialize();
    });

    it("should throw an error when fetch is unavailable", async () => {
      scriptListLoader.fetchImpl = null;

      await expect(scriptListLoader.loadFromManifest()).rejects.toThrow("Fetch is unavailable when loading the script manifest");
    });

    it("should load and process scripts from the manifest", async () => {
      // Mock fetch to return HTML with scripts
      const mockFetchWithScripts = () => {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('<script src="script1.js"></script><script src="script2.js"></script>')
        });
      };

      scriptListLoader.fetchImpl = mockFetchWithScripts;

      // Mock the loadScript method to track calls
      const loadScriptSpy = jest.fn().mockResolvedValue();
      scriptListLoader.loadScript = loadScriptSpy;

      await scriptListLoader.loadFromManifest();

      expect(loadScriptSpy).toHaveBeenCalledTimes(2);
      expect(loadScriptSpy).toHaveBeenCalledWith("script1.js");
      expect(loadScriptSpy).toHaveBeenCalledWith("script2.js");
    });

    it("should throw an error when manifest request fails", async () => {
      const mockFailingFetch = () => {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve('')
        });
      };

      scriptListLoader.fetchImpl = mockFailingFetch;

      await expect(scriptListLoader.loadFromManifest()).rejects.toThrow("Failed to load script manifest");
    });

    it("should handle empty document gracefully", async () => {
      scriptListLoader.document = null;

      const mockFetch = () => {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('<script src="test.js"></script>')
        });
      };

      scriptListLoader.fetchImpl = mockFetch;

      // Should not throw, just return early
      await expect(scriptListLoader.loadFromManifest()).resolves.not.toThrow();
    });
  });

  describe("load method", () => {
    beforeEach(() => {
      scriptListLoader = new ScriptListLoader(mockConfig);
      scriptListLoader.initialize();
    });

    it("should return early if document is not available", async () => {
      scriptListLoader.document = null;

      // Should not throw
      await expect(scriptListLoader.load()).resolves.not.toThrow();
    });

    it("should call loadFromManifest when document is available", async () => {
      const loadFromManifestSpy = jest.fn().mockResolvedValue();
      scriptListLoader.loadFromManifest = loadFromManifestSpy;

      await scriptListLoader.load();

      expect(loadFromManifestSpy).toHaveBeenCalled();
    });

    it("should log errors if loadFromManifest fails", async () => {
      const error = new Error("Manifest load failed");
      const loadFromManifestSpy = jest.fn().mockRejectedValue(error);
      const logSpy = jest.fn();
      
      scriptListLoader.loadFromManifest = loadFromManifestSpy;
      scriptListLoader.log = logSpy;

      await scriptListLoader.load();

      expect(loadFromManifestSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("load:error", error);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", async () => {
      scriptListLoader = new ScriptListLoader(mockConfig);

      // Before initialization
      expect(scriptListLoader.initialized).toBe(false);

      // Initialize
      const initResult = scriptListLoader.initialize();
      expect(initResult).toBe(scriptListLoader);
      expect(scriptListLoader.initialized).toBe(true);

      // Properties should be set
      expect(scriptListLoader.document).toBe(mockDocument);
      expect(scriptListLoader.fetchImpl).toBe(mockFetch);
    });

    it("should handle complete load flow", async () => {
      // Mock successful fetch and document operations
      const mockFetchForLoad = () => {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('<script src="test.js"></script>')
        });
      };

      scriptListLoader = new ScriptListLoader({
        document: mockDocument,
        fetch: mockFetchForLoad,
        rootHandler: new MockGlobalRootHandler()
      });
      scriptListLoader.initialize();

      // Mock loadScript to resolve immediately
      scriptListLoader.loadScript = jest.fn().mockResolvedValue();

      // Execute load
      await scriptListLoader.load();

      // Should have called loadFromManifest internally
      // This test verifies the flow works without errors
      expect(scriptListLoader.document).toBeDefined();
    });
  });
});