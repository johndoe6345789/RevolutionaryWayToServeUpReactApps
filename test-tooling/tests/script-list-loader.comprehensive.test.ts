// Mock GlobalRootHandler before importing ScriptListLoader
jest.mock("../../../bootstrap/constants/global-root-handler.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        getDocument: jest.fn(),
        getFetch: jest.fn(),
        getLogger: jest.fn(),
        root: {},
        getNamespace: jest.fn(),
        helpers: {},
      };
    })
  };
});

import ScriptListLoader from "../../../bootstrap/services/core/script-list-loader-service.js";

// Mock dependencies
const mockDocument = {
  createElement: jest.fn(),
  head: { appendChild: jest.fn() },
  querySelectorAll: jest.fn(),
};

const mockFetch = jest.fn();
const mockLog = jest.fn();

const mockConfig = {
  document: mockDocument,
  manifestUrl: "test-manifest.json",
  fetch: mockFetch,
  log: mockLog,
};

describe("ScriptListLoader", () => {
  let scriptListLoader;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock DOM elements
    const mockScriptElement = {
      src: "",
      async: false,
      onload: null,
      onerror: null,
    };
    
    mockDocument.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === "script") {
        return { ...mockScriptElement };
      } else if (tag === "template") {
        return {
          innerHTML: "",
          content: { querySelectorAll: mockDocument.querySelectorAll }
        };
      }
      return {};
    });
    
    scriptListLoader = new ScriptListLoader(mockConfig);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(scriptListLoader).toBeInstanceOf(ScriptListLoader);
      expect(scriptListLoader.config).toBeDefined();
    });

    it("should normalize config when not a ScriptListLoaderConfig instance", () => {
      const loader = new ScriptListLoader({ document: mockDocument });
      expect(loader.config).toBeDefined();
    });

    it("should use provided rootHandler if available in config", () => {
      const mockRootHandler = { getDocument: jest.fn() };
      const configWithHandler = { ...mockConfig, rootHandler: mockRootHandler };
      const loader = new ScriptListLoader(configWithHandler);
      
      expect(loader.rootHandler).toBe(mockRootHandler);
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      scriptListLoader.initialize();
      
      expect(scriptListLoader.document).toBe(mockDocument);
      expect(scriptListLoader.manifestUrl).toBe("test-manifest.json");
      expect(scriptListLoader.fetchImpl).toBe(mockFetch);
      expect(scriptListLoader.log).toBe(mockLog);
      expect(scriptListLoader.initialized).toBe(true);
    });

    it("should return the instance for chaining", () => {
      const result = scriptListLoader.initialize();
      expect(result).toBe(scriptListLoader);
    });

    it("should throw if already initialized", () => {
      scriptListLoader.initialize();
      expect(() => scriptListLoader.initialize()).toThrow(/already initialized/);
    });
  });

  describe("loadScript method", () => {
    beforeEach(() => {
      scriptListLoader.initialize();
    });

    it("should throw an error if document is not available", async () => {
      scriptListLoader.document = null;
      
      await expect(scriptListLoader.loadScript("test.js")).rejects.toThrow(
        "Document is unavailable when loading scripts"
      );
    });

    it("should create and append a script element to the document", async () => {
      const mockScript = {
        src: "",
        async: false,
        onload: null,
        onerror: null,
      };
      mockDocument.createElement.mockReturnValue(mockScript);
      
      // Mock the parent element
      mockDocument.head = { appendChild: jest.fn() };
      
      // Resolve the promise after a short delay
      const promise = scriptListLoader.loadScript("test.js");
      
      // Simulate successful load
      mockScript.onload();
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalledWith("script");
      expect(mockScript.src).toBe("test.js");
      expect(mockScript.async).toBe(false);
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockScript);
    });

    it("should reject the promise if script fails to load", async () => {
      const mockScript = {
        src: "",
        async: false,
        onload: null,
        onerror: null,
      };
      mockDocument.createElement.mockReturnValue(mockScript);
      
      mockDocument.head = { appendChild: jest.fn() };
      
      const promise = scriptListLoader.loadScript("test.js");
      
      // Simulate error
      mockScript.onerror();
      
      await expect(promise).rejects.toThrow("Failed to load test.js");
    });
  });

  describe("loadFromManifest method", () => {
    beforeEach(() => {
      scriptListLoader.initialize();
    });

    it("should throw an error if fetch is not available", async () => {
      scriptListLoader.fetchImpl = null;
      
      await expect(scriptListLoader.loadFromManifest()).rejects.toThrow(
        "Fetch is unavailable when loading the script manifest"
      );
    });

    it("should fetch the manifest and load scripts", async () => {
      // Mock fetch response
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<script src="script1.js"></script><script src="script2.js"></script>'),
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      // Mock querySelectorAll to return script elements
      const mockScript1 = { getAttribute: () => "script1.js" };
      const mockScript2 = { getAttribute: () => "script2.js" };
      mockDocument.querySelectorAll.mockReturnValue([mockScript1, mockScript2]);
      
      // Mock loadScript to resolve immediately
      scriptListLoader.loadScript = jest.fn().mockResolvedValue();
      
      await scriptListLoader.loadFromManifest();
      
      expect(mockFetch).toHaveBeenCalledWith("test-manifest.json", { cache: "no-store" });
      expect(scriptListLoader.loadScript).toHaveBeenCalledTimes(2);
      expect(scriptListLoader.loadScript).toHaveBeenCalledWith("script1.js");
      expect(scriptListLoader.loadScript).toHaveBeenCalledWith("script2.js");
    });

    it("should throw an error if fetch response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(scriptListLoader.loadFromManifest()).rejects.toThrow(
        "Failed to load script manifest test-manifest.json: 404"
      );
    });

    it("should handle missing src attributes gracefully", async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<script src="script1.js"></script><script></script>'),
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const mockScriptWithSrc = { getAttribute: () => "script1.js" };
      const mockScriptWithoutSrc = { getAttribute: () => null };
      mockDocument.querySelectorAll.mockReturnValue([mockScriptWithSrc, mockScriptWithoutSrc]);
      
      scriptListLoader.loadScript = jest.fn().mockResolvedValue();
      
      await scriptListLoader.loadFromManifest();
      
      // Only the script with src should be loaded
      expect(scriptListLoader.loadScript).toHaveBeenCalledTimes(1);
      expect(scriptListLoader.loadScript).toHaveBeenCalledWith("script1.js");
    });
  });

  describe("load method", () => {
    beforeEach(() => {
      scriptListLoader.initialize();
    });

    it("should return early if document is not available", async () => {
      scriptListLoader.document = null;
      
      await expect(scriptListLoader.load()).resolves.toBeUndefined();
    });

    it("should call loadFromManifest and handle success", async () => {
      scriptListLoader.loadFromManifest = jest.fn().mockResolvedValue();
      
      await scriptListLoader.load();
      
      expect(scriptListLoader.loadFromManifest).toHaveBeenCalled();
    });

    it("should catch errors from loadFromManifest and log them", async () => {
      const testError = new Error("Test error");
      scriptListLoader.loadFromManifest = jest.fn().mockRejectedValue(testError);
      
      await scriptListLoader.load();
      
      expect(scriptListLoader.loadFromManifest).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalledWith("load:error", testError);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", async () => {
      const loader = new ScriptListLoader(mockConfig);
      loader.initialize();
      
      expect(loader.document).toBe(mockDocument);
      expect(loader.manifestUrl).toBe("test-manifest.json");
      expect(loader.fetchImpl).toBe(mockFetch);
      expect(loader.log).toBe(mockLog);
      expect(loader.initialized).toBe(true);
    });
  });
});