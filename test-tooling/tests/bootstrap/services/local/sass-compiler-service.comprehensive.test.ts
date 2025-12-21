import SassCompilerService from "../../../../../bootstrap/services/local/sass-compiler-service.js";
import SassCompilerConfig from "../../../../../bootstrap/configs/local/sass-compiler.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.registeredServices = new Map();
  }
  
  register(name, service, metadata) {
    this.registeredServices.set(name, { service, metadata });
  }
  
  getService(name) {
    const entry = this.registeredServices.get(name);
    return entry ? entry.service : null;
  }
}

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
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.textContent = '';
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
}

// Mock fetch implementation
const mockFetch = (url, options) => {
  if (url.includes('error')) {
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve('')
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('.test { color: red; }')
  });
};

// Mock Sass implementation for testing different scenarios
const createMockSassImpl = (type) => {
  switch (type) {
    case 'function':
      return function() {
        return {
          compile: (scss, callback) => {
            callback({ status: 0, text: '.compiled { color: blue; }' });
          }
        };
      };
    case 'object-with-callback':
      return {
        compile: (scss, callback) => {
          callback({ status: 0, text: '.compiled { color: blue; }' });
        }
      };
    case 'object-with-sync':
      return {
        compile: (scss) => {
          return { css: '.compiled { color: blue; }' };
        }
      };
    case 'object-with-string':
      return {
        compile: (scss) => {
          return '.compiled { color: blue; }';
        }
      };
    default:
      return null;
  }
};

describe("SassCompilerService", () => {
  let sassCompilerService;
  let mockServiceRegistry;
  let mockDocument;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockDocument = new MockDocument();
    
    const config = new SassCompilerConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: {},
      fetch: mockFetch,
      document: mockDocument
    });
    
    sassCompilerService = new SassCompilerService(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(sassCompilerService.config).toBeDefined();
      expect(sassCompilerService.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        serviceRegistry: mockServiceRegistry,
        namespace: {},
        fetch: mockFetch,
        document: mockDocument
      };
      
      const service = new SassCompilerService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.document).toBe(mockDocument);
    });

    it("should use default config when none provided", () => {
      const service = new SassCompilerService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      sassCompilerService.initialize();
      
      expect(sassCompilerService.serviceRegistry).toBe(mockServiceRegistry);
      expect(sassCompilerService.fetchImpl).toBe(mockFetch);
      expect(sassCompilerService.document).toBe(mockDocument);
      expect(sassCompilerService.namespace).toBeDefined();
      expect(sassCompilerService.helpers).toBeDefined();
      expect(sassCompilerService.initialized).toBe(true);
    });

    it("should prevent double initialization", () => {
      sassCompilerService.initialize();
      
      expect(() => sassCompilerService.initialize()).toThrow("SassCompilerService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = sassCompilerService.initialize();
      expect(result).toBe(sassCompilerService);
    });
  });

  describe("compileSCSS method", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should throw an error when fetch is unavailable", async () => {
      sassCompilerService.fetchImpl = null;
      
      await expect(sassCompilerService.compileSCSS("test.scss"))
        .rejects.toThrow("Fetch is unavailable when compiling SCSS");
    });

    it("should throw an error when document is unavailable", async () => {
      sassCompilerService.document = null;
      
      await expect(sassCompilerService.compileSCSS("test.scss"))
        .rejects.toThrow("Document is unavailable for Sass compilation");
    });

    it("should throw an error when SassImpl is not available", async () => {
      await expect(sassCompilerService.compileSCSS("test.scss"))
        .rejects.toThrow("Sass global not found (is your Sass tool loaded?)");
    });

    it("should compile SCSS successfully with function-based SassImpl", async () => {
      const mockSassImpl = createMockSassImpl('function');
      sassCompilerService.SassImpl = mockSassImpl;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe('.compiled { color: blue; }');
    });

    it("should compile SCSS successfully with object callback-based SassImpl", async () => {
      const mockSassImpl = createMockSassImpl('object-with-callback');
      sassCompilerService.SassImpl = mockSassImpl;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe('.compiled { color: blue; }');
    });

    it("should compile SCSS successfully with sync object-based SassImpl", async () => {
      const mockSassImpl = createMockSassImpl('object-with-sync');
      sassCompilerService.SassImpl = mockSassImpl;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe('.compiled { color: blue; }');
    });

    it("should compile SCSS successfully with string-returning SassImpl", async () => {
      const mockSassImpl = createMockSassImpl('object-with-string');
      sassCompilerService.SassImpl = mockSassImpl;
      
      const result = await sassCompilerService.compileSCSS("test.scss");
      
      expect(result).toBe('.compiled { color: blue; }');
    });

    it("should handle Sass compilation errors", async () => {
      const mockSassImpl = {
        compile: (scss, callback) => {
          callback({ status: 1, formatted: 'Sass compilation error' });
        }
      };
      sassCompilerService.SassImpl = mockSassImpl;
      
      await expect(sassCompilerService.compileSCSS("test.scss"))
        .rejects.toThrow('Sass compilation error');
    });

    it("should throw error when fetch fails", async () => {
      await expect(sassCompilerService.compileSCSS("error.scss"))
        .rejects.toThrow("Failed to load error.scss");
    });

    it("should handle unsupported Sass implementation", async () => {
      const mockSassImpl = {
        compile: 'not-a-function'
      };
      sassCompilerService.SassImpl = mockSassImpl;
      
      await expect(sassCompilerService.compileSCSS("test.scss"))
        .rejects.toThrow("Unsupported Sass implementation: neither constructor nor usable compile() found");
    });
  });

  describe("injectCSS method", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should throw an error when document is unavailable", () => {
      sassCompilerService.document = null;
      
      expect(() => sassCompilerService.injectCSS(".test { color: red; }"))
        .toThrow("Document is unavailable when injecting CSS");
    });

    it("should inject CSS into document head", () => {
      const css = ".test { color: red; }";
      sassCompilerService.injectCSS(css);
      
      expect(mockDocument.head.children).toHaveLength(1);
      const styleTag = mockDocument.head.children[0];
      expect(styleTag.tagName).toBe('style');
      expect(styleTag.textContent).toBe(css);
    });

    it("should handle different CSS content", () => {
      const css = ".another { background: blue; }";
      sassCompilerService.injectCSS(css);
      
      expect(mockDocument.head.children).toHaveLength(1);
      const styleTag = mockDocument.head.children[0];
      expect(styleTag.textContent).toBe(css);
    });
  });

  describe("exports getter", () => {
    beforeEach(() => {
      sassCompilerService.initialize();
    });

    it("should return the public API", () => {
      const exports = sassCompilerService.exports;
      
      expect(typeof exports.compileSCSS).toBe("function");
      expect(typeof exports.injectCSS).toBe("function");
    });

    it("should bind methods to the service instance", () => {
      const exports = sassCompilerService.exports;
      
      // These should be bound methods
      expect(exports.compileSCSS).not.toBe(sassCompilerService.compileSCSS);
      expect(exports.injectCSS).not.toBe(sassCompilerService.injectCSS);
    });
  });

  describe("install method", () => {
    let mockNamespace;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      const config = new SassCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        fetch: mockFetch,
        document: mockDocument
      });
      
      sassCompilerService = new SassCompilerService(config);
      sassCompilerService.initialize();
    });

    it("should throw if not initialized", () => {
      const freshService = new SassCompilerService(sassCompilerService.config);
      
      expect(() => freshService.install()).toThrow("SassCompilerService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = sassCompilerService.install();
      
      expect(result).toBe(sassCompilerService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("sassCompiler");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/local",
        domain: "local"
      });
      
      // Check that helpers were set up
      expect(mockNamespace.helpers.sassCompiler).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = sassCompilerService.install();
      expect(result).toBe(sassCompilerService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(sassCompilerService.initialized).toBe(false);
      
      // Initialize
      const initResult = sassCompilerService.initialize();
      expect(initResult).toBe(sassCompilerService);
      expect(sassCompilerService.initialized).toBe(true);
      
      // Install
      const installResult = sassCompilerService.install();
      expect(installResult).toBe(sassCompilerService);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("sassCompiler")).toBeDefined();
    });

    it("should handle complete SCSS compilation and injection flow", async () => {
      sassCompilerService.initialize();
      
      // Set up a working Sass implementation
      const mockSassImpl = createMockSassImpl('object-with-callback');
      sassCompilerService.SassImpl = mockSassImpl;
      
      // Compile SCSS
      const css = await sassCompilerService.compileSCSS("test.scss");
      expect(css).toBe('.compiled { color: blue; }');
      
      // Inject CSS
      sassCompilerService.injectCSS(css);
      
      // Verify CSS was injected
      expect(mockDocument.head.children).toHaveLength(1);
      expect(mockDocument.head.children[0].textContent).toBe('.compiled { color: blue; }');
    });
  });
});