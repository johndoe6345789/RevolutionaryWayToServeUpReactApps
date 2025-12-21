// Comprehensive test suite for SassCompilerService class
const SassCompilerService = require("../../../../../bootstrap/services/local/sass-compiler-service.js");

// Simple mock function implementation for Bun
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = undefined;
  mockFn.mockReturnValue = (value) => {
    mockFn.returnValue = value;
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

describe("SassCompilerService", () => {
  let service;
  let mockConfig;
  let mockServiceRegistry;
  let mockDocument;
  let mockFetch;
  let mockSassImpl;

  beforeEach(() => {
    mockServiceRegistry = {
      register: createMockFunction()
    };

    mockDocument = {
      createElement: createMockFunction().mockReturnValue({
        textContent: '',
        setAttribute: createMockFunction()
      }),
      head: {
        appendChild: createMockFunction()
      }
    };

    mockFetch = createMockFunction();
    mockSassImpl = {
      compile: createMockFunction()
    };

    mockConfig = {
      fetch: mockFetch,
      document: mockDocument,
      SassImpl: mockSassImpl,
      serviceRegistry: mockServiceRegistry,
      namespace: { helpers: {} }
    };

    service = new SassCompilerService(mockConfig);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      expect(service).toBeInstanceOf(SassCompilerService);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new SassCompilerService();
      expect(serviceWithDefault).toBeInstanceOf(SassCompilerService);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      const initializedService = service.initialize();

      expect(initializedService).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.fetchImpl).toBe(mockFetch);
      expect(service.document).toBe(mockDocument);
      expect(service.SassImpl).toBe(mockSassImpl);
    });

    test("should set up namespace and helpers", () => {
      const mockNamespace = { helpers: {} };
      mockConfig.namespace = mockNamespace;
      const serviceWithNamespace = new SassCompilerService(mockConfig);
      
      serviceWithNamespace.initialize();

      expect(serviceWithNamespace.namespace).toBe(mockNamespace);
      expect(serviceWithNamespace.helpers).toBe(mockNamespace.helpers);
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });

    test("should require service registry", () => {
      const configWithoutRegistry = {
        fetch: mockFetch,
        document: mockDocument,
        SassImpl: mockSassImpl
      };
      const serviceWithoutRegistry = new SassCompilerService(configWithoutRegistry);
      
      expect(() => {
        serviceWithoutRegistry.initialize();
      }).toThrow();
    });
  });

  describe("compileSCSS method", () => {
    test("should throw error if fetch is not available", async () => {
      service.initialize();
      service.fetchImpl = null;

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Fetch is unavailable when compiling SCSS");
    });

    test("should throw error if document is not available", async () => {
      service.initialize();
      service.document = null;

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Document is unavailable for Sass compilation");
    });

    test("should fetch and compile SCSS successfully", async () => {
      const mockText = createMockFunction().mockResolvedValue("$primary-color: #333;");
      const mockResponse = {
        ok: true,
        text: mockText
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockSassImpl.compile = (scss) => ({ css: ".test { color: #333; }" });

      service.initialize();

      const result = await service.compileSCSS("/test.scss");

      expect(mockFetch.calls.length).toBeGreaterThan(0);
      expect(mockFetch.calls[0][0]).toBe("/test.scss");
      expect(mockFetch.calls[0][1]).toEqual({ cache: "no-store" });
      expect(mockText.calls.length).toBeGreaterThan(0);
      expect(result).toBe(".test { color: #333; }");
    });

    test("should throw error if fetch response is not ok", async () => {
      const mockResponse = {
        ok: false,
        text: createMockFunction().mockResolvedValue("")
      };
      mockFetch.mockResolvedValue(mockResponse);

      service.initialize();

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Failed to load /test.scss");
    });

    test("should throw error if SassImpl is not available", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);
      service.initialize();
      service.SassImpl = null;

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Sass global not found (is your Sass tool loaded?)");
    });

    test("should handle Sass compilation with callback-style implementation", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that uses callbacks
      const mockCallbackSass = function() {};
      mockCallbackSass.prototype.compile = (scss, callback) => {
        callback({ status: 0, text: ".compiled { color: red; }" });
      };

      service.initialize();
      service.SassImpl = mockCallbackSass;

      const result = await service.compileSCSS("/test.scss");
      expect(result).toBe(".compiled { color: red; }");
    });
  });

  describe("injectCSS method", () => {
    test("should throw error if document is not available", () => {
      service.document = null;

      expect(() => {
        service.injectCSS("body { margin: 0; }");
      }).toThrow("Document is unavailable when injecting CSS");
    });

    test("should inject CSS into document head", () => {
      service.initialize();

      service.injectCSS("body { margin: 0; }");

      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.createElement.calls[0][0]).toBe("style");
      expect(mockDocument.head.appendChild.calls.length).toBeGreaterThan(0);
    });

    test("should create style element with correct CSS content", () => {
      service.initialize();
      const mockStyleElement = {
        textContent: '',
        setAttribute: createMockFunction()
      };
      mockDocument.createElement = createMockFunction().mockReturnValue(mockStyleElement);

      service.injectCSS("div { color: blue; }");

      expect(mockStyleElement.textContent).toBe("div { color: blue; }");
    });
  });

  describe("exports property", () => {
    test("should return the correct export structure", () => {
      service.initialize();

      const exports = service.exports;

      expect(exports).toHaveProperty("compileSCSS");
      expect(exports).toHaveProperty("injectCSS");
      expect(typeof exports.compileSCSS).toBe("function");
      expect(typeof exports.injectCSS).toBe("function");
    });

    test("should bind methods to the service instance", () => {
      service.initialize();

      const exports = service.exports;

      // Verify that the methods are bound to the service
      expect(exports.compileSCSS).not.toBe(service.compileSCSS);
      expect(exports.injectCSS).not.toBe(service.injectCSS);
    });
  });

  describe("install method", () => {
    test("should register the service in the registry", () => {
      service.initialize();

      const installedService = service.install();

      expect(installedService).toBe(service);
      expect(mockServiceRegistry.register.calls.length).toBeGreaterThan(0);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("sassCompiler");
      const exportedFunctions = mockServiceRegistry.register.calls[0][1];
      expect(exportedFunctions).toHaveProperty('compileSCSS');
      expect(exportedFunctions).toHaveProperty('injectCSS');
      expect(typeof exportedFunctions.compileSCSS).toBe('function');
      expect(typeof exportedFunctions.injectCSS).toBe('function');
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/local",
        domain: "local",
      });
    });

    test("should install helpers into the namespace", () => {
      service.initialize();

      service.install();

      expect(service.helpers.sassCompiler).toHaveProperty('compileSCSS');
      expect(service.helpers.sassCompiler).toHaveProperty('injectCSS');
      expect(typeof service.helpers.sassCompiler.compileSCSS).toBe('function');
      expect(typeof service.helpers.sassCompiler.injectCSS).toBe('function');
    });

    test("should throw if not initialized before install", () => {
      expect(() => {
        service.install();
      }).toThrow(); // Should throw because not initialized
    });

    test("should return the service instance for chaining", () => {
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", async () => {
      service.initialize();

      // Test that compileSCSS can be called (with mocks in place)
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockSassImpl.compile = (scss) => ({ css: ".test { color: #333; }" });

      const compiledCSS = await service.compileSCSS("/test.scss");
      expect(compiledCSS).toBe(".test { color: #333; }");

      // Test that injectCSS works
      service.injectCSS(".test { color: red; }");
      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.createElement.calls[0][0]).toBe("style");

      // Test that install works
      service.install();
      expect(mockServiceRegistry.register.calls.length).toBeGreaterThan(0);
      expect(mockServiceRegistry.register.calls[mockServiceRegistry.register.calls.length-1][0]).toBe("sassCompiler");
    });
  });
});