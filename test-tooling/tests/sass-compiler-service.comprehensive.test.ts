import SassCompilerService from "../../bootstrap/services/local/sass-compiler-service.js";

describe("SassCompilerService", () => {
  let sassCompilerService;
  let mockServiceRegistry;
  let mockNamespace;
  let mockDocument;
  let mockFetch;
  let mockSassImpl;

  beforeEach(() => {
    mockServiceRegistry = {
      register: jest.fn(),
    };
    
    mockNamespace = {
      helpers: {},
    };
    
    mockDocument = {
      createElement: jest.fn().mockReturnValue({ textContent: "" }),
      head: { appendChild: jest.fn() },
    };
    
    mockFetch = jest.fn();
    mockSassImpl = {
      compile: jest.fn(),
    };
    
    const SassCompilerConfig = require("../../bootstrap/configs/local/sass-compiler.js");
    const config = new SassCompilerConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace,
      document: mockDocument,
      fetch: mockFetch,
      SassImpl: mockSassImpl,
    });
    
    sassCompilerService = new SassCompilerService(config);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(sassCompilerService).toBeInstanceOf(SassCompilerService);
      expect(sassCompilerService.config).toBeDefined();
    });

    it("should create an instance with default config when none provided", () => {
      const service = new SassCompilerService();
      expect(service).toBeInstanceOf(SassCompilerService);
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const result = sassCompilerService.initialize();
      
      expect(sassCompilerService.serviceRegistry).toBe(mockServiceRegistry);
      expect(sassCompilerService.fetchImpl).toBe(mockFetch);
      expect(sassCompilerService.document).toBe(mockDocument);
      expect(sassCompilerService.SassImpl).toBe(mockSassImpl);
      expect(sassCompilerService.namespace).toBe(mockNamespace);
      expect(sassCompilerService.helpers).toBe(mockNamespace.helpers);
      expect(sassCompilerService.initialized).toBe(true);
      expect(result).toBe(sassCompilerService);
    });

    it("should throw if already initialized", () => {
      sassCompilerService.initialize();
      
      expect(() => {
        sassCompilerService.initialize();
      }).toThrow(/already initialized/);
    });

    it("should require service registry", () => {
      const SassCompilerConfig = require("../../bootstrap/configs/local/sass-compiler.js");
      const config = new SassCompilerConfig({
        serviceRegistry: null,
        namespace: mockNamespace,
        document: mockDocument,
        fetch: mockFetch,
        SassImpl: mockSassImpl,
      });
      
      const service = new SassCompilerService(config);
      
      expect(() => {
        service.initialize();
      }).toThrow("ServiceRegistry required for SassCompilerService");
    });
  });

  describe("compileSCSS method", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should throw an error if fetch is not available", async () => {
      sassCompilerService.fetchImpl = null;
      
      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow(
        "Fetch is unavailable when compiling SCSS"
      );
    });

    it("should throw an error if document is not available", async () => {
      sassCompilerService.document = null;
      
      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow(
        "Document is unavailable for Sass compilation"
      );
    });

    it("should throw an error if SassImpl is not available", async () => {
      // Mock fetch to return a successful response first, so we get past the fetch step
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$test: red; .test { color: $test; }")
      });

      sassCompilerService.SassImpl = null;

      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow(
        "Sass global not found (is your Sass tool loaded?)"
      );
    });

    it("should compile SCSS using function-based SassImpl", async () => {
      // Mock fetch to return SCSS content
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$test: red; .test { color: $test; }")
      });

      const mockSassConstructor = jest.fn().mockImplementation(() => {
        return {
          compile: (scss, callback) => {
            callback({ status: 0, text: "compiled css" });
          }
        };
      });

      sassCompilerService.SassImpl = mockSassConstructor;

      const result = await sassCompilerService.compileSCSS("test.scss");

      expect(result).toBe("compiled css");
    });

    it("should handle Sass compilation errors", async () => {
      // Mock fetch to return SCSS content
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$test: red; .test { color: $test; }")
      });

      const mockSassConstructor = jest.fn().mockImplementation(() => {
        return {
          compile: (scss, callback) => {
            callback({ status: 1, formatted: "Sass error" });
          }
        };
      });

      sassCompilerService.SassImpl = mockSassConstructor;

      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow("Sass error");
    });

    it("should compile SCSS using object callback-based SassImpl", async () => {
      // Mock fetch to return SCSS content
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$test: red; .test { color: $test; }")
      });

      const mockSassObject = {
        compile: (scss, callback) => {
          callback({ status: 0, text: "compiled css" });
        }
      };

      sassCompilerService.SassImpl = mockSassObject;

      const result = await sassCompilerService.compileSCSS("test.scss");

      expect(result).toBe("compiled css");
    });

    it("should compile SCSS using sync object-based SassImpl", async () => {
      const mockSassObject = {
        compile: (scss) => {
          return { css: "compiled css" };
        }
      };
      
      sassCompilerService.SassImpl = mockSassObject;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe("compiled css");
    });

    it("should compile SCSS with string return from SassImpl", async () => {
      const mockSassObject = {
        compile: (scss) => {
          return "compiled css";
        }
      };
      
      sassCompilerService.SassImpl = mockSassObject;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe("compiled css");
    });

    it("should handle unsupported Sass implementation", async () => {
      const mockSassObject = {
        // No compile method
      };
      
      sassCompilerService.SassImpl = mockSassObject;
      
      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow(
        "Unsupported Sass implementation: neither constructor nor usable compile() found"
      );
    });

    it("should throw error when fetch fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue("Not found"),
      });
      
      await expect(sassCompilerService.compileSCSS("test.scss")).rejects.toThrow(
        "Failed to load test.scss"
      );
    });

    it("should fetch SCSS content successfully", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$test: red; .test { color: $test; }"),
      });
      
      const mockSassObject = {
        compile: (scss) => {
          expect(scss).toBe("$test: red; .test { color: $test; }");
          return { css: "compiled css" };
        }
      };
      
      sassCompilerService.SassImpl = mockSassObject;
      
      await sassCompilerService.compileSCSS("test.scss");
    });
  });

  describe("injectCSS method", () => {
    it("should throw an error if document is not available", () => {
      sassCompilerService.document = null;
      
      expect(() => {
        sassCompilerService.injectCSS("test css");
      }).toThrow("Document is unavailable when injecting CSS");
    });

    it("should inject CSS into document head", () => {
      sassCompilerService.document = mockDocument;
      
      sassCompilerService.injectCSS("test css");
      
      expect(mockDocument.createElement).toHaveBeenCalledWith("style");
      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toBe("test css");
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(styleElement);
    });

    it("should handle different CSS content", () => {
      sassCompilerService.document = mockDocument;
      
      sassCompilerService.injectCSS("body { margin: 0; }");
      
      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toBe("body { margin: 0; }");
    });
  });

  describe("exports property", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should return the public API", () => {
      const exports = sassCompilerService.exports;
      
      expect(exports).toHaveProperty('compileSCSS');
      expect(exports).toHaveProperty('injectCSS');
      expect(typeof exports.compileSCSS).toBe('function');
      expect(typeof exports.injectCSS).toBe('function');
    });

    it("should bind methods to the service instance", () => {
      const exports = sassCompilerService.exports;
      const originalCompileSCSS = sassCompilerService.compileSCSS;
      
      // Spy on the original method to verify it's called with the right context
      const spy = jest.spyOn(sassCompilerService, 'compileSCSS');
      
      exports.compileSCSS("test.scss");
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("install method", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should throw if not initialized", () => {
      const uninitializedService = new SassCompilerService();
      
      expect(() => {
        uninitializedService.install();
      }).toThrow(/not initialized/);
    });

    it("should register the service and set up helpers", () => {
      const result = sassCompilerService.install();
      
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "sassCompiler",
        expect.any(Object),
        { folder: "services/local", domain: "local" },
        []
      );
      
      expect(sassCompilerService.namespace.helpers.sassCompiler).toBeDefined();
      expect(result).toBe(sassCompilerService);
    });

    it("should return the instance to allow chaining", () => {
      const result = sassCompilerService.install();
      
      expect(result).toBe(sassCompilerService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", async () => {
      expect(sassCompilerService.initialized).toBe(false);
      
      const initResult = sassCompilerService.initialize();
      
      expect(initResult).toBe(sassCompilerService);
      expect(sassCompilerService.initialized).toBe(true);
      
      // Test that exports work
      const exports = sassCompilerService.exports;
      expect(typeof exports.compileSCSS).toBe('function');
      expect(typeof exports.injectCSS).toBe('function');
      
      // Install the service
      const installResult = sassCompilerService.install();
      expect(installResult).toBe(sassCompilerService);
      
      // Verify it was registered
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "sassCompiler",
        expect.any(Object),
        { folder: "services/local", domain: "local" },
        []
      );
    });

    it("should handle complete SCSS compilation and injection flow", async () => {
      sassCompilerService.initialize();
      
      // Mock successful fetch and Sass compilation
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("$color: red; div { color: $color; }"),
      });
      
      const mockSassObject = {
        compile: (scss) => {
          return { css: "div { color: red; }" };
        }
      };
      
      sassCompilerService.SassImpl = mockSassObject;
      
      // Compile SCSS
      const css = await sassCompilerService.compileSCSS("test.scss");
      expect(css).toBe("div { color: red; }");
      
      // Inject CSS
      sassCompilerService.document = mockDocument;
      sassCompilerService.injectCSS(css);
      
      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toBe("div { color: red; }");
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(styleElement);
    });
  });
});