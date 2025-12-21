// Comprehensive test suite for SassCompilerService class
const SassCompilerService = require("../../../../../bootstrap/services/local/sass-compiler-service.js");

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
  mockFn.mockResolvedValue = (value) => {
    mockFn.returnValue = Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockRejectedValue = (error) => {
    mockFn.returnValue = Promise.reject(error);
    return mockFn;
  };
  mockFn.mockReturnValueOnce = (value) => {
    mockFn.returnValuesQueue.push(value);
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
    
    // Mock Sass implementation
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
      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.fetchImpl).toBe(mockFetch);
      expect(service.document).toBe(mockDocument);
      expect(service.SassImpl).toBe(mockSassImpl);
      expect(service.namespace).toBe(mockConfig.namespace);
      expect(service.helpers).toBe(mockConfig.namespace.helpers);
    });

    test("should register the service in the service registry", () => {
      service.initialize();

      expect(mockServiceRegistry.register.calls.length).toBeGreaterThan(0);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("sassCompiler");
      expect(mockServiceRegistry.register.calls[0][1]).toBe(service.exports || service);
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/local",
        domain: "local",
      });
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });

    test("should return the service instance to allow chaining", () => {
      const result = service.initialize();

      expect(result).toBe(service);
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

    test("should compile SCSS successfully with function-based SassImpl", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that uses a constructor
      const mockSassInstance = {
        compile: (scss, callback) => {
          callback({ status: 0, text: ".test { color: #333; }" });
        }
      };
      const mockSassConstructor = jest.fn().mockImplementation(() => mockSassInstance);
      
      service.initialize();
      service.SassImpl = mockSassConstructor;

      const result = await service.compileSCSS("/test.scss");

      expect(mockFetch).toHaveBeenCalledWith("/test.scss", { cache: "no-store" });
      expect(mockResponse.text).toHaveBeenCalled();
      expect(result).toBe(".test { color: #333; }");
    });

    test("should compile SCSS successfully with object callback-based SassImpl", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that uses a callback-based compile method
      const mockSassObject = {
        compile: (scss, callback) => {
          callback({ status: 0, text: ".test { color: #333; }" });
        }
      };
      service.initialize();
      service.SassImpl = mockSassObject;

      const result = await service.compileSCSS("/test.scss");

      expect(result).toBe(".test { color: #333; }");
    });

    test("should compile SCSS successfully with sync object-based SassImpl", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that returns a sync result
      const mockSassObject = {
        compile: (scss) => ({ status: 0, text: ".test { color: #333; }" })
      };
      service.initialize();
      service.SassImpl = mockSassObject;

      const result = await service.compileSCSS("/test.scss");

      expect(result).toBe(".test { color: #333; }");
    });

    test("should compile SCSS successfully with string-returning SassImpl", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that returns a string directly
      const mockSassObject = {
        compile: (scss) => ".compiled { color: red; }"
      };
      service.initialize();
      service.SassImpl = mockSassObject;

      const result = await service.compileSCSS("/test.scss");

      expect(result).toBe(".compiled { color: red; }");
    });

    test("should handle Sass compilation errors", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock a Sass implementation that returns an error
      const mockSassObject = {
        compile: (scss, callback) => {
          callback({ status: 1, formatted: "Sass compilation error" });
        }
      };
      service.initialize();
      service.SassImpl = mockSassObject;

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Sass compilation error");
    });

    test("should throw error when fetch fails", async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      mockFetch.mockResolvedValue(mockResponse);

      service.initialize();

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Failed to load /test.scss");
    });

    test("should handle unsupported Sass implementation", async () => {
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$primary-color: #333;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Mock an unsupported Sass implementation
      const unsupportedSassImpl = {};
      service.initialize();
      service.SassImpl = unsupportedSassImpl;

      await expect(service.compileSCSS("/test.scss")).rejects.toThrow("Unsupported Sass implementation: neither constructor nor usable compile() found");
    });
  });

  describe("injectCSS method", () => {
    test("should throw an error when document is not available", () => {
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
      const styleElement = mockDocument.createElement.returnValue;
      expect(styleElement.textContent).toBe("body { margin: 0; }");
      expect(mockDocument.head.appendChild.calls.length).toBeGreaterThan(0);
    });

    test("should handle different CSS content", () => {
      service.initialize();

      service.injectCSS(".header { color: blue; }");

      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.createElement.calls[0][0]).toBe("style");
      const styleElement = mockDocument.createElement.returnValue;
      expect(styleElement.textContent).toBe(".header { color: blue; }");
    });
  });

  describe("exports property", () => {
    test("should return the public API", () => {
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
    test("should throw if not initialized", () => {
      expect(() => {
        service.install();
      }).toThrow();
    });

    test("should register the service and set up helpers", () => {
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
      expect(mockServiceRegistry.register.calls.length).toBeGreaterThan(0);
      expect(mockServiceRegistry.register.calls[0][0]).toBe("sassCompiler");
      expect(mockServiceRegistry.register.calls[0][1]).toEqual(service.exports);
      expect(mockServiceRegistry.register.calls[0][2]).toEqual({
        folder: "services/local",
        domain: "local",
      });
      expect(service.helpers.sassCompiler).toBe(service.exports);
    });

    test("should return the instance to allow chaining", () => {
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
    });
  });

  describe("integration tests", () => {
    test("should work through full lifecycle", async () => {
      // Initialize the service
      service.initialize();

      // Verify initialization
      expect(service.initialized).toBe(true);
      expect(service.fetchImpl).toBe(mockFetch);
      expect(service.document).toBe(mockDocument);

      // Mock successful SCSS compilation
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$test: value;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      const mockSassObject = {
        compile: (scss) => ".test { color: red; }"
      };
      service.SassImpl = mockSassObject;

      // Compile SCSS
      const compiledCSS = await service.compileSCSS("/integration-test.scss");
      expect(compiledCSS).toBe(".test { color: red; }");

      // Inject CSS
      service.injectCSS(".test { color: blue; }");
      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.createElement.calls[1][0]).toBe("style");

      // Install the service
      service.install();
      expect(service.helpers.sassCompiler).toBe(service.exports);
    });

    test("should handle complete SCSS compilation and injection flow", async () => {
      service.initialize();

      // Mock a successful fetch and Sass compilation
      const mockResponse = {
        ok: true,
        text: createMockFunction().mockResolvedValue("$color: red;")
      };
      mockFetch.mockResolvedValue(mockResponse);

      const mockSassObject = {
        compile: (scss) => ({
          status: 0,
          text: ".compiled { color: red; }"
        })
      };
      service.SassImpl = mockSassObject;

      // Full flow: compile and inject
      const css = await service.compileSCSS("/full-flow-test.scss");
      service.injectCSS(css);

      expect(css).toBe(".compiled { color: red; }");
      expect(mockDocument.createElement.calls.length).toBeGreaterThan(0);
      expect(mockDocument.head.appendChild.calls.length).toBeGreaterThan(0);
    });
  });
});