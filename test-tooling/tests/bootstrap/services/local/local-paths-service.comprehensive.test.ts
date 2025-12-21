import LocalPathsService from "../../../../../bootstrap/services/local/local-paths-service.js";
import LocalPathsConfig from "../../../../../bootstrap/configs/local/local-paths.js";

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

describe("LocalPathsService", () => {
  let localPathsService;
  let mockServiceRegistry;
  let mockNamespace;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockNamespace = { helpers: {} };
    
    const config = new LocalPathsConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace
    });
    
    localPathsService = new LocalPathsService(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(localPathsService.config).toBeDefined();
      expect(localPathsService.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      };
      
      const service = new LocalPathsService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.namespace).toBe(mockNamespace);
    });

    it("should use default config when none provided", () => {
      const service = new LocalPathsService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      localPathsService.initialize();
      
      expect(localPathsService.LOCAL_MODULE_EXTENSIONS).toBeDefined();
      expect(Array.isArray(localPathsService.LOCAL_MODULE_EXTENSIONS)).toBe(true);
      expect(localPathsService.namespace).toBe(mockNamespace);
      expect(localPathsService.helpers).toBe(mockNamespace.helpers);
      expect(localPathsService.serviceRegistry).toBe(mockServiceRegistry);
      expect(localPathsService.initialized).toBe(true);
    });

    it("should prevent double initialization", () => {
      localPathsService.initialize();
      
      expect(() => localPathsService.initialize()).toThrow("LocalPathsService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = localPathsService.initialize();
      expect(result).toBe(localPathsService);
    });
  });

  describe("isLocalModule method", () => {
    it("should return true for relative paths starting with '.'", () => {
      expect(localPathsService.isLocalModule("./module")).toBe(true);
      expect(localPathsService.isLocalModule("../module")).toBe(true);
      expect(localPathsService.isLocalModule("./sub/module")).toBe(true);
    });

    it("should return true for absolute paths starting with '/'", () => {
      expect(localPathsService.isLocalModule("/module")).toBe(true);
      expect(localPathsService.isLocalModule("/sub/module")).toBe(true);
    });

    it("should return false for non-local paths", () => {
      expect(localPathsService.isLocalModule("module")).toBe(false);
      expect(localPathsService.isLocalModule("npm:module")).toBe(false);
      expect(localPathsService.isLocalModule("http://example.com/module")).toBe(false);
    });

    it("should return false for paths not starting with '.' or '/'", () => {
      expect(localPathsService.isLocalModule("module")).toBe(false);
      expect(localPathsService.isLocalModule("my-module")).toBe(false);
    });
  });

  describe("normalizeDir method", () => {
    it("should return empty string for falsy input", () => {
      expect(localPathsService.normalizeDir(null)).toBe("");
      expect(localPathsService.normalizeDir(undefined)).toBe("");
      expect(localPathsService.normalizeDir("")).toBe("");
      expect(localPathsService.normalizeDir(0)).toBe("");
    });

    it("should remove leading slashes", () => {
      expect(localPathsService.normalizeDir("/path")).toBe("path");
      expect(localPathsService.normalizeDir("//path")).toBe("path");
      expect(localPathsService.normalizeDir("///path")).toBe("path");
    });

    it("should remove trailing slashes", () => {
      expect(localPathsService.normalizeDir("path/")).toBe("path");
      expect(localPathsService.normalizeDir("path//")).toBe("path");
      expect(localPathsService.normalizeDir("path///")).toBe("path");
    });

    it("should remove both leading and trailing slashes", () => {
      expect(localPathsService.normalizeDir("/path/")).toBe("path");
      expect(localPathsService.normalizeDir("//path//")).toBe("path");
    });

    it("should handle paths with no slashes", () => {
      expect(localPathsService.normalizeDir("path")).toBe("path");
    });

    it("should handle complex paths", () => {
      expect(localPathsService.normalizeDir("/complex/path/")).toBe("complex/path");
      // Note: The method only removes leading/trailing slashes, not internal ones
      expect(localPathsService.normalizeDir("//another///complex///path//")).toBe("another///complex///path");
    });
  });

  describe("makeAliasKey method", () => {
    it("should combine normalized directory and name with pipe separator", () => {
      const result = localPathsService.makeAliasKey("module", "/path/");
      expect(result).toBe("path|module");
    });

    it("should normalize the directory part", () => {
      const result = localPathsService.makeAliasKey("module", "///path///");
      expect(result).toBe("path|module");
    });

    it("should handle empty directory", () => {
      const result = localPathsService.makeAliasKey("module", "");
      expect(result).toBe("|module");
    });

    it("should handle empty name", () => {
      const result = localPathsService.makeAliasKey("", "path");
      expect(result).toBe("path|");
    });

    it("should handle both empty", () => {
      const result = localPathsService.makeAliasKey("", "");
      expect(result).toBe("|");
    });
  });

  describe("resolveLocalModuleBase method", () => {
    it("should resolve relative paths based on base directory", () => {
      const result = localPathsService.resolveLocalModuleBase("./module", "base/path", "http://example.com/app/");
      expect(result).toContain("base/path/module");
    });

    it("should use current location if no href provided", () => {
      // This test is more complex as it depends on the global 'location' object
      const result = localPathsService.resolveLocalModuleBase("./module", "base/path");
      expect(typeof result).toBe("string");
      expect(result).toContain("base/path");
    });

    it("should handle root-based paths", () => {
      const result = localPathsService.resolveLocalModuleBase("/module", "base/path", "http://example.com/app/");
      // Should resolve relative to the base URL
      expect(typeof result).toBe("string");
    });

    it("should handle different base directories", () => {
      const result = localPathsService.resolveLocalModuleBase("../module", "base/path", "http://example.com/app/dir/");
      expect(typeof result).toBe("string");
    });
  });

  describe("getModuleDir method", () => {
    it("should return empty string for paths without directory", () => {
      expect(localPathsService.getModuleDir("file.js")).toBe("");
      expect(localPathsService.getModuleDir("index")).toBe("");
    });

    it("should return directory part of the path", () => {
      expect(localPathsService.getModuleDir("dir/file.js")).toBe("dir");
      expect(localPathsService.getModuleDir("path/to/file.js")).toBe("path/to");
    });

    it("should handle paths ending with slash", () => {
      expect(localPathsService.getModuleDir("dir/")).toBe("dir");
    });

    it("should handle complex paths", () => {
      expect(localPathsService.getModuleDir("a/b/c/d/file.js")).toBe("a/b/c/d");
    });
  });

  describe("hasKnownExtension method", () => {
    it("should return true for files with known extensions", () => {
      expect(localPathsService.hasKnownExtension("file.js")).toBe(true);
      expect(localPathsService.hasKnownExtension("file.ts")).toBe(true);
      expect(localPathsService.hasKnownExtension("file.jsx")).toBe(true);
      expect(localPathsService.hasKnownExtension("file.tsx")).toBe(true);
    });

    it("should return false for files with unknown extensions", () => {
      expect(localPathsService.hasKnownExtension("file.css")).toBe(false);
      expect(localPathsService.hasKnownExtension("file.json")).toBe(false);
      expect(localPathsService.hasKnownExtension("file.html")).toBe(false);
    });

    it("should return false for files without extensions", () => {
      expect(localPathsService.hasKnownExtension("file")).toBe(false);
      expect(localPathsService.hasKnownExtension("file.")).toBe(false);
    });

    it("should handle complex paths", () => {
      expect(localPathsService.hasKnownExtension("path/to/file.js")).toBe(true);
      expect(localPathsService.hasKnownExtension("path/to/file.unknown")).toBe(false);
    });
  });

  describe("getCandidateLocalPaths method", () => {
    beforeEach(() => {
      if (!localPathsService.initialized) {
        localPathsService.initialize();
      }
    });

    it("should return the original path as candidate", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/file.js");
      expect(candidates).toContain("path/file.js");
    });

    it("should return original path without trailing slashes", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/");
      expect(candidates).toContain("path");
    });

    it("should return paths with extensions if no known extension", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/file");
      // Should include the original path and paths with extensions
      expect(candidates).toContain("path/file");
      // Should also include with extensions, but we can't easily predict the exact extensions
      expect(candidates.length).toBeGreaterThan(1);
    });

    it("should return index files for directories", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/dir");
      // Should include the original path and index files with extensions
      expect(candidates).toContain("path/dir");
      expect(candidates.some(c => c.includes("index"))).toBe(true);
    });

    it("should not duplicate candidates", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/file.js");
      // Since file.js has a known extension, it should just return the original
      const uniqueCandidates = [...new Set(candidates)];
      expect(candidates.length).toBe(uniqueCandidates.length);
    });

    it("should handle extensionless files with multiple extensions", () => {
      const candidates = localPathsService.getCandidateLocalPaths("path/file");
      expect(candidates).toContain("path/file");
      // Should include candidates with extensions
      const hasExtensionCandidates = candidates.some(candidate =>
        localPathsService.LOCAL_MODULE_EXTENSIONS.some(ext => candidate.endsWith(ext))
      );
      expect(hasExtensionCandidates).toBe(true);
    });
  });

  describe("exports getter", () => {
    beforeEach(() => {
      localPathsService.initialize();
    });

    it("should return the public API", () => {
      const exports = localPathsService.exports;
      
      expect(typeof exports.isLocalModule).toBe("function");
      expect(typeof exports.normalizeDir).toBe("function");
      expect(typeof exports.makeAliasKey).toBe("function");
      expect(typeof exports.resolveLocalModuleBase).toBe("function");
      expect(typeof exports.getModuleDir).toBe("function");
      expect(typeof exports.hasKnownExtension).toBe("function");
      expect(typeof exports.getCandidateLocalPaths).toBe("function");
    });

    it("should bind methods to the service instance", () => {
      const exports = localPathsService.exports;
      
      // These should be bound methods
      expect(exports.isLocalModule).not.toBe(localPathsService.isLocalModule);
      expect(exports.normalizeDir).not.toBe(localPathsService.normalizeDir);
    });
  });

  describe("install method", () => {
    let freshService;

    beforeEach(() => {
      const config = new LocalPathsConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      
      freshService = new LocalPathsService(config);
      freshService.initialize();
    });

    it("should throw if not initialized", () => {
      const uninitializedService = new LocalPathsService(freshService.config);
      
      expect(() => uninitializedService.install()).toThrow("LocalPathsService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = freshService.install();
      
      expect(result).toBe(freshService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("localPaths");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/local",
        domain: "local"
      });
      
      // Check that helpers were set up
      expect(mockNamespace.helpers.localPaths).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = freshService.install();
      expect(result).toBe(freshService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(localPathsService.initialized).toBe(false);
      
      // Initialize
      const initResult = localPathsService.initialize();
      expect(initResult).toBe(localPathsService);
      expect(localPathsService.initialized).toBe(true);
      
      // Install
      const installResult = localPathsService.install();
      expect(installResult).toBe(localPathsService);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("localPaths")).toBeDefined();
    });

    it("should handle complete path resolution flow", () => {
      localPathsService.initialize();
      
      // Test various path operations
      expect(localPathsService.isLocalModule("./test")).toBe(true);
      expect(localPathsService.normalizeDir("/path/")).toBe("path");
      expect(localPathsService.makeAliasKey("module", "/base/")).toBe("base|module");
      expect(localPathsService.getModuleDir("path/file.js")).toBe("path");
      expect(localPathsService.hasKnownExtension("file.tsx")).toBe(true);
      
      const candidates = localPathsService.getCandidateLocalPaths("test");
      expect(candidates).toContain("test");
      expect(Array.isArray(candidates)).toBe(true);
    });
  });
});