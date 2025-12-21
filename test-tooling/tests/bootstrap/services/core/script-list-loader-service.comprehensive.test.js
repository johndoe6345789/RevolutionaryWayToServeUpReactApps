// Comprehensive test suite for ScriptListLoader class
const ScriptListLoader = require("../../../../../bootstrap/services/core/script-list-loader-service.js");
const ScriptListLoaderConfig = require("../../../../../bootstrap/configs/core/script-list-loader.js");
const GlobalRootHandler = require("../../../../../bootstrap/constants/global-root-handler.js");

// Simple mock function implementation for Bun
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    if (mockFn.returnValuesQueue.length > 0) {
      return mockFn.returnValuesQueue.shift();
    }
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = undefined;
  mockFn.returnValuesQueue = [];
  mockFn.mockReturnValue = (value) => {
    mockFn.returnValue = value;
    return mockFn;
  };
  mockFn.mockReturnValueOnce = (value) => {
    mockFn.returnValuesQueue.push(value);
    return mockFn;
  };
  mockFn.mockResolvedValue = (value) => {
    mockFn.returnValue = Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockRejectedValue = (error) => {
    mockFn.returnValue = Promise.reject(error);
    return mockFn;
  };
  return mockFn;
}

describe("ScriptListLoader", () => {
  let service;
  let mockConfig;
  let mockDocument;
  let mockFetch;
  let mockLog;
  let mockRootHandler;

  beforeEach(() => {
    mockDocument = {
      createElement: createMockFunction().mockReturnValue({
        src: "",
        async: false,
        onload: null,
        onerror: null,
        setAttribute: createMockFunction(),
        addEventListener: createMockFunction()
      }),
      head: {
        appendChild: createMockFunction()
      },
      documentElement: {
        appendChild: createMockFunction()
      }
    };

    mockFetch = createMockFunction();
    mockLog = createMockFunction();
    mockRootHandler = new GlobalRootHandler();

    mockConfig = {
      document: mockDocument,
      manifestUrl: "/manifest.json",
      fetch: mockFetch,
      log: mockLog,
      rootHandler: mockRootHandler
    };

    service = new ScriptListLoader(mockConfig);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      expect(service).toBeInstanceOf(ScriptListLoader);
      expect(service.config).toBeDefined();
      expect(service.rootHandler).toBe(mockRootHandler);
    });

    test("should normalize config when a plain object is provided", () => {
      const plainConfig = {
        document: mockDocument,
        manifestUrl: "/test.json",
        fetch: mockFetch,
        log: mockLog
      };
      
      const serviceWithPlainConfig = new ScriptListLoader(plainConfig);
      
      expect(serviceWithPlainConfig).toBeInstanceOf(ScriptListLoader);
      expect(serviceWithPlainConfig.config).toBeInstanceOf(ScriptListLoaderConfig);
      expect(serviceWithPlainConfig.config.document).toBe(mockDocument);
      expect(serviceWithPlainConfig.config.manifestUrl).toBe("/test.json");
      expect(serviceWithPlainConfig.config.fetch).toBe(mockFetch);
      expect(serviceWithPlainConfig.config.log).toBe(mockLog);
    });

    test("should use GlobalRootHandler when none is provided in config", () => {
      const configWithoutRootHandler = {
        document: mockDocument,
        manifestUrl: "/test.json",
        fetch: mockFetch,
        log: mockLog
      };
      
      const serviceWithoutRootHandler = new ScriptListLoader(configWithoutRootHandler);
      
      expect(serviceWithoutRootHandler.rootHandler).toBeInstanceOf(GlobalRootHandler);
    });

    test("should accept ScriptListLoaderConfig instance directly", () => {
      const configInstance = new ScriptListLoaderConfig({
        document: mockDocument,
        manifestUrl: "/test.json",
        fetch: mockFetch,
        log: mockLog
      });
      
      const serviceWithConfigInstance = new ScriptListLoader(configInstance);
      
      expect(serviceWithConfigInstance.config).toBe(configInstance);
    });
  });

  describe("initialize method", () => {
    test("should set up internal properties", () => {
      const result = service.initialize();
      
      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.document).toBe(mockConfig.document);
      expect(service.manifestUrl).toBe(mockConfig.manifestUrl);
      expect(service.fetchImpl).toBe(mockConfig.fetch);
      expect(service.log).toBe(mockConfig.log);
    });

    test("should return the instance for chaining", () => {
      const result = service.initialize();
      
      expect(result).toBe(service);
    });

    test("should throw if already initialized", () => {
      service.initialize();
      
      expect(() => {
        service.initialize();
      }).toThrow();
    });
  });

  describe("loadScript method", () => {
    test("should throw an error if document is not available", async () => {
      service.initialize();
      service.document = null;
      
      await expect(service.loadScript("/test.js")).rejects.toThrow("Document is unavailable when loading scripts");
    });

    test("should create and append a script element to the document", async () => {
      service.initialize();
      
      // Mock the script element with proper callbacks
      const scriptElement = {
        src: "",
        async: false,
        onload: null,
        onerror: null,
        setAttribute: createMockFunction()
      };
      
      mockDocument.createElement = createMockFunction().mockReturnValue(scriptElement);
      mockDocument.head.appendChild = createMockFunction();
      
      // Resolve the script loading immediately
      const promise = service.loadScript("/test.js");
      
      // Trigger the onload callback
      scriptElement.onload();
      
      await promise;
      
      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.createElement.calls[0][0]).toBe("script");
      expect(scriptElement.src).toBe("/test.js");
      expect(scriptElement.async).toBe(false);
      expect(mockDocument.head.appendChild.calls.length).toBeGreaterThan(0);
    });

    test("should reject when script fails to load", async () => {
      service.initialize();
      
      const scriptElement = {
        src: "",
        async: false,
        onload: null,
        onerror: null,
        setAttribute: createMockFunction()
      };
      
      mockDocument.createElement = createMockFunction().mockReturnValue(scriptElement);
      
      const promise = service.loadScript("/test.js");
      
      // Trigger the onerror callback
      scriptElement.onerror();
      
      await expect(promise).rejects.toThrow("Failed to load /test.js");
    });

    test("should append script to documentElement if head is not available", async () => {
      service.initialize();
      mockDocument.head = null;
      
      const scriptElement = {
        src: "",
        async: false,
        onload: null,
        onerror: null,
        setAttribute: createMockFunction()
      };
      
      mockDocument.createElement = createMockFunction().mockReturnValue(scriptElement);
      mockDocument.documentElement.appendChild = createMockFunction();
      
      const promise = service.loadScript("/test.js");
      scriptElement.onload();
      
      await promise;
      
      expect(mockDocument.documentElement.appendChild.calls.length).toBeGreaterThan(0);
    });
  });

  describe("loadFromManifest method", () => {
    test("should throw an error when fetch is not available", async () => {
      service.initialize();
      service.fetchImpl = null;
      
      await expect(service.loadFromManifest()).rejects.toThrow("Fetch is unavailable when loading the script manifest");
    });

    test("should load and process scripts from the manifest", async () => {
      service.initialize();
      
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue(`
          <html>
            <head>
              <script src="/script1.js"></script>
              <script src="/script2.js"></script>
            </head>
          </html>
        `)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      // Mock document methods
      const mockScripts = [
        { getAttribute: () => "/script1.js" },
        { getAttribute: () => "/script2.js" }
      ];
      const templateElement = {
        set innerHTML(value) {
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML;
        },
        content: {
          querySelectorAll: createMockFunction().mockReturnValue(mockScripts)
        }
      };

      let createElementCallCount1 = 0;
      mockDocument.createElement = (...args) => {
        mockDocument.createElement.calls.push(args);
        createElementCallCount1++;
        if (createElementCallCount1 === 1) {
          return { /* script element */ };
        } else if (createElementCallCount1 === 2) {
          return templateElement;
        } else {
          return { /* another script element */ };
        }
      };
      mockDocument.createElement.calls = [];
      
      // Mock script loading
      const originalLoadScript = service.loadScript;
      service.loadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      
      await service.loadFromManifest();
      
      expect(mockFetch).toHaveBeenCalledWith("/manifest.json", { cache: "no-store" });
      expect(service.loadScript).toHaveBeenCalledTimes(2);
      expect(service.loadScript).toHaveBeenCalledWith("/script1.js");
      expect(service.loadScript).toHaveBeenCalledWith("/script2.js");
    });

    test("should throw an error when manifest request fails", async () => {
      service.initialize();
      
      const mockResponse = {
        ok: false,
        status: 404
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(service.loadFromManifest()).rejects.toThrow("Failed to load script manifest /manifest.json: 404");
    });

    test("should handle empty document gracefully", async () => {
      service.initialize();
      service.document = null;
      
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("<html><body></body></html>")
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      // Should not throw when document is null
      await expect(service.loadFromManifest()).resolves.not.toThrow();
    });
  });

  describe("load method", () => {
    test("should return early if document is not available", async () => {
      service.initialize();
      service.document = null;
      
      // Should not throw
      await expect(service.load()).resolves.not.toThrow();
    });

    test("should call loadFromManifest and handle success", async () => {
      service.initialize();
      
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue(`
          <html>
            <head>
              <script src="/script1.js"></script>
            </head>
          </html>
        `)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const templateElement = {
        set innerHTML(value) {
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML;
        },
        content: {
          querySelectorAll: createMockFunction().mockReturnValue([
            { getAttribute: () => "/script1.js" }
          ])
        }
      };

      let createElementCallCount3 = 0;
      mockDocument.createElement = (...args) => {
        mockDocument.createElement.calls.push(args);
        createElementCallCount3++;
        if (createElementCallCount3 === 1) {
          return { /* script element */ };
        } else if (createElementCallCount3 === 2) {
          return templateElement;
        } else {
          return { /* another script element */ };
        }
      };
      mockDocument.createElement.calls = [];

      service.loadScript = createMockFunction().mockResolvedValue(Promise.resolve());

      await service.load();

      expect(service.loadScript.calls.length).toBeGreaterThan(0);
      expect(service.loadScript.calls[0][0]).toBe("/script1.js");
    });

    test("should catch errors from loadFromManifest and log them", async () => {
      service.initialize();
      
      mockFetch.mockRejectedValue(new Error("Network error"));
      
      await service.load();
      
      expect(mockLog.calls.length).toBeGreaterThan(0);
      expect(mockLog.calls[0][0]).toBe("load:error");
      expect(mockLog.calls[0][1]).toBeInstanceOf(Error);
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", async () => {
      // Initialize the service
      service.initialize();
      
      // Verify initialization
      expect(service.initialized).toBe(true);
      expect(service.document).toBe(mockDocument);
      expect(service.manifestUrl).toBe("/manifest.json");
      
      // Mock a successful manifest load
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue(`
          <html>
            <head>
              <script src="/integration-test.js"></script>
            </head>
          </html>
        `)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const templateElement = {
        set innerHTML(value) {
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML;
        },
        content: {
          querySelectorAll: createMockFunction().mockReturnValue([
            { getAttribute: () => "/integration-test.js" }
          ])
        }
      };
      
      let createElementCallCount4 = 0;
      mockDocument.createElement = (...args) => {
        mockDocument.createElement.calls.push(args);
        createElementCallCount4++;
        if (createElementCallCount4 === 1) {
          return { /* script element */ };
        } else if (createElementCallCount4 === 2) {
          return templateElement;
        } else {
          return { /* another script element */ };
        }
      };
      mockDocument.createElement.calls = [];

      // Mock script loading to succeed
      const originalLoadScript = service.loadScript.bind(service);
      service.loadScript = createMockFunction().mockResolvedValue(Promise.resolve());

      // Load the manifest
      await service.loadFromManifest();

      // Verify scripts were processed
      expect(service.loadScript.calls.length).toBeGreaterThan(0);
      expect(service.loadScript.calls[0][0]).toBe("/integration-test.js");
    });

    test("should handle complete load flow", async () => {
      service.initialize();
      
      // Mock document methods
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue(`
          <html>
            <head>
              <script src="/complete-flow-test.js"></script>
            </head>
          </html>
        `)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const templateElement = {
        innerHTML: '',
        content: {
          querySelectorAll: createMockFunction().mockReturnValue([
            { getAttribute: () => "/complete-flow-test.js" }
          ])
        }
      };
      
      let createElementCallCount5 = 0;
      mockDocument.createElement = (...args) => {
        mockDocument.createElement.calls.push(args);
        createElementCallCount5++;
        if (createElementCallCount5 === 1) {
          return { /* script element */ };
        } else if (createElementCallCount5 === 2) {
          return templateElement;
        } else {
          return { /* another script element */ };
        }
      };
      mockDocument.createElement.calls = [];
      
      service.loadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      
      // Run the complete load flow
      await service.load();
      
      expect(service.loadScript).toHaveBeenCalledWith("/complete-flow-test.js");
    });
  });
});