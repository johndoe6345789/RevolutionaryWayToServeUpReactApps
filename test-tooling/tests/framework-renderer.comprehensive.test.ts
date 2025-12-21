import FrameworkRenderer from "../../bootstrap/services/local/framework-renderer.js";

describe("FrameworkRenderer", () => {
  let frameworkRenderer;
  let mockDocument;
  let mockRegistry;
  let mockApp;

  beforeEach(() => {
    mockDocument = {
      getElementById: jest.fn(),
    };
    
    mockRegistry = {
      dom: {
        createRoot: jest.fn(),
      },
      react: {
        createElement: jest.fn(),
      },
    };
    
    mockApp = { name: "TestApp" };
    
    const config = new FrameworkRenderer.Config({ document: mockDocument });
    frameworkRenderer = new FrameworkRenderer(config);
  });

  describe("FrameworkRendererConfig", () => {
    describe("constructor", () => {
      it("should initialize with provided document", () => {
        const doc = { getElementById: jest.fn() };
        const config = new FrameworkRenderer.Config({ document: doc });
        
        expect(config.document).toBe(doc);
      });

      it("should initialize with undefined document when not provided", () => {
        const config = new FrameworkRenderer.Config();
        
        expect(config.document).toBeUndefined();
      });

      it("should accept document in config object", () => {
        const doc = { getElementById: jest.fn() };
        const config = new FrameworkRenderer.Config({ document: doc });
        
        expect(config.document).toBe(doc);
      });
    });
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(frameworkRenderer).toBeInstanceOf(FrameworkRenderer);
      expect(frameworkRenderer.config).toBeDefined();
    });

    it("should create an instance with default config when none provided", () => {
      const renderer = new FrameworkRenderer();
      expect(renderer).toBeInstanceOf(FrameworkRenderer);
      expect(renderer.config).toBeDefined();
    });

    it("should initialize document to null initially", () => {
      expect(frameworkRenderer.document).toBeNull();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const result = frameworkRenderer.initialize();
      
      expect(frameworkRenderer.document).toBe(mockDocument);
      expect(frameworkRenderer.initialized).toBe(true);
      expect(result).toBe(frameworkRenderer);
    });

    it("should throw an error if no document is provided", () => {
      const config = new FrameworkRenderer.Config({ document: undefined });
      const renderer = new FrameworkRenderer(config);
      
      expect(() => {
        renderer.initialize();
      }).toThrow("Document required for FrameworkRenderer");
    });

    it("should throw an error if document is null", () => {
      const config = new FrameworkRenderer.Config({ document: null });
      const renderer = new FrameworkRenderer(config);
      
      expect(() => {
        renderer.initialize();
      }).toThrow("Document required for FrameworkRenderer");
    });

    it("should throw if already initialized", () => {
      frameworkRenderer.initialize();
      
      expect(() => {
        frameworkRenderer.initialize();
      }).toThrow(/already initialized/);
    });
  });

  describe("render method", () => {
    beforeEach(() => {
      frameworkRenderer.initialize();
      
      // Mock the root element
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);
    });

    it("should throw an error if root element is not found", () => {
      mockDocument.getElementById.mockReturnValue(null);
      
      const config = { render: { rootId: "nonexistent" } };
      
      expect(() => {
        frameworkRenderer.render(config, mockRegistry, mockApp);
      }).toThrow("Root element not found: #nonexistent");
    });

    it("should throw an error if DOM module is missing", () => {
      const config = { render: { domModule: "missingDom", reactModule: "react" } };
      const badRegistry = { react: mockRegistry.react }; // No dom module
      
      expect(() => {
        frameworkRenderer.render(config, badRegistry, mockApp);
      }).toThrow("DOM render module missing: missingDom");
    });

    it("should throw an error if React module is missing", () => {
      const config = { render: { domModule: "dom", reactModule: "missingReact" } };
      const badRegistry = { dom: mockRegistry.dom }; // No react module
      
      expect(() => {
        frameworkRenderer.render(config, badRegistry, mockApp);
      }).toThrow("React module missing: missingReact");
    });

    it("should render the app with default settings", () => {
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);

      const mockCreateRoot = jest.fn().mockReturnValue(mockRootElement);
      const mockCreateElement = jest.fn().mockReturnValue("element");

      const registryWithMocks = {
        dom: { createRoot: mockCreateRoot },
        react: { createElement: mockCreateElement }
      };

      const config = {
        render: {
          domModule: "dom",
          reactModule: "react",
          createRoot: "createRoot"  // Need to specify this
        }
      };

      frameworkRenderer.render(config, registryWithMocks, mockApp);

      expect(mockDocument.getElementById).toHaveBeenCalledWith("root");
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
      expect(mockCreateElement).toHaveBeenCalledWith(mockApp);
    });

    it("should use custom rootId if provided", () => {
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);
      
      const mockCreateRoot = jest.fn().mockReturnValue(mockRootElement);
      const mockCreateElement = jest.fn().mockReturnValue("element");
      
      const registryWithMocks = {
        dom: { createRoot: mockCreateRoot },
        react: { createElement: mockCreateElement }
      };
      
      const config = { 
        render: { 
          domModule: "dom", 
          reactModule: "react",
          rootId: "custom-root"
        } 
      };
      
      frameworkRenderer.render(config, registryWithMocks, mockApp);
      
      expect(mockDocument.getElementById).toHaveBeenCalledWith("custom-root");
    });

    it("should throw if createRoot function is not found", () => {
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);
      
      const registryWithMissingCreateRoot = {
        dom: {}, // Missing createRoot
        react: { createElement: jest.fn() }
      };
      
      const config = { 
        render: { 
          domModule: "dom", 
          reactModule: "react",
          createRoot: "createRoot"
        } 
      };
      
      expect(() => {
        frameworkRenderer.render(config, registryWithMissingCreateRoot, mockApp);
      }).toThrow("createRoot not found: createRoot");
    });

    it("should throw if createElement function is not found", () => {
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);
      
      const mockCreateRoot = jest.fn().mockReturnValue(mockRootElement);
      
      const registryWithMissingCreateElement = {
        dom: { createRoot: mockCreateRoot },
        react: {} // Missing createElement
      };
      
      const config = { 
        render: { 
          domModule: "dom", 
          reactModule: "react"
        } 
      };
      
      expect(() => {
        frameworkRenderer.render(config, registryWithMissingCreateElement, mockApp);
      }).toThrow("createElement not found on React module");
    });

    it("should throw if render method is not found", () => {
      const mockRootElement = { }; // No render method
      mockDocument.getElementById.mockReturnValue(mockRootElement);
      
      const mockCreateRoot = jest.fn().mockReturnValue(mockRootElement);
      const mockCreateElement = jest.fn().mockReturnValue("element");
      
      const registryWithMocks = {
        dom: { createRoot: mockCreateRoot },
        react: { createElement: mockCreateElement }
      };
      
      const config = { 
        render: { 
          domModule: "dom", 
          reactModule: "react",
          renderMethod: "nonexistentMethod"
        } 
      };
      
      expect(() => {
        frameworkRenderer.render(config, registryWithMocks, mockApp);
      }).toThrow("Render method not found: nonexistentMethod");
    });
  });

  describe("_getModuleExport method", () => {
    it("should return null when module is missing", () => {
      const result = frameworkRenderer._getModuleExport(null, "testExport");
      expect(result).toBeNull();
    });

    it("should return named export when present", () => {
      const mockModule = { testExport: "exportValue" };
      const result = frameworkRenderer._getModuleExport(mockModule, "testExport");
      expect(result).toBe("exportValue");
    });

    it("should return default named export when present", () => {
      const mockModule = { 
        default: { testExport: "defaultExportValue" } 
      };
      const result = frameworkRenderer._getModuleExport(mockModule, "testExport");
      expect(result).toBe("defaultExportValue");
    });

    it("should return null when named export is not found", () => {
      const mockModule = { otherExport: "otherValue" };
      const result = frameworkRenderer._getModuleExport(mockModule, "testExport");
      expect(result).toBeNull();
    });

    it("should handle modules with both direct and default exports", () => {
      const mockModule = { 
        testExport: "directValue",
        default: { testExport: "defaultValue" } 
      };
      // Direct export takes precedence
      const result = frameworkRenderer._getModuleExport(mockModule, "testExport");
      expect(result).toBe("directValue");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const doc = { getElementById: jest.fn() };
      const config = new FrameworkRenderer.Config({ document: doc });
      const renderer = new FrameworkRenderer(config);
      
      expect(renderer.initialized).toBe(false);
      expect(renderer.document).toBeNull();
      
      const result = renderer.initialize();
      
      expect(result).toBe(renderer);
      expect(renderer.initialized).toBe(true);
      expect(renderer.document).toBe(doc);
    });

    it("should handle complete rendering flow", () => {
      frameworkRenderer.initialize();
      
      const mockRootElement = { render: jest.fn() };
      mockDocument.getElementById.mockReturnValue(mockRootElement);
      
      const mockCreateRoot = jest.fn().mockReturnValue(mockRootElement);
      const mockCreateElement = jest.fn().mockReturnValue("element");
      
      const registry = {
        dom: { createRoot: mockCreateRoot },
        react: { createElement: mockCreateElement }
      };
      
      const config = { 
        render: { 
          domModule: "dom", 
          reactModule: "react" 
        } 
      };
      
      frameworkRenderer.render(config, registry, mockApp);
      
      // Verify all steps happened
      expect(mockDocument.getElementById).toHaveBeenCalledWith("root");
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
      expect(mockCreateElement).toHaveBeenCalledWith(mockApp);
      expect(mockRootElement.render).toHaveBeenCalled();
    });
  });
});