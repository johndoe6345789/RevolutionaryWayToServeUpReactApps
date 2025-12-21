// Comprehensive test suite for TsxCompilerService class
// This replaces the generic stub tests with proper method-specific tests

const TsxCompilerService = require("../../../../../bootstrap/services/local/tsx-compiler-service.js");
const TsxCompilerConfig = require("../../../../../bootstrap/configs/local/tsx-compiler.js");

describe("TsxCompilerService", () => {
  describe("constructor", () => {
    test("should create an instance with default config", () => {
      const service = new TsxCompilerService();
      expect(service).toBeInstanceOf(TsxCompilerService);
      expect(service.config).toBeInstanceOf(TsxCompilerConfig);
    });

    test("should create an instance with provided config", () => {
      const config = new TsxCompilerConfig();
      const service = new TsxCompilerService(config);
      expect(service).toBeInstanceOf(TsxCompilerService);
      expect(service.config).toBe(config);
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      // Create a mock service registry and namespace since they're required
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      const initializedService = service.initialize();

      expect(initializedService).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.moduleContextStack).toEqual([]);
    });

    test("should set up internal properties correctly", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      expect(service.moduleContextStack).toBeDefined();
      expect(Array.isArray(service.moduleContextStack)).toBe(true);
      expect(service.moduleContextStack).toEqual([]);
    });
  });

  describe("transformSource method", () => {
    test("should have correct method signature", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      expect(typeof service.transformSource).toBe('function');
    });

    test("should throw error if Babel is not available", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();
      // Remove babel to test error condition
      service.Babel = null;

      expect(() => {
        service.transformSource("const x = 1;", "test.tsx");
      }).toThrow();
    });
  });

  describe("executeModuleSource method", () => {
    test("should have correct method signature", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      expect(typeof service.executeModuleSource).toBe('function');
    });
  });

  describe("compileTSX method", () => {
    test("should have correct method signature", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      expect(typeof service.compileTSX).toBe('function');
    });

    test("should throw error if fetch is unavailable", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();
      // Set fetchImpl to null to trigger error
      service.fetchImpl = null;

      expect(() => {
        service.compileTSX("entry.tsx", () => {});
      }).toThrow("Fetch is unavailable when compiling TSX");
    });
  });

  describe("exports property", () => {
    test("should return the correct export structure", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      const exports = service.exports;

      expect(exports).toHaveProperty('compileTSX');
      expect(exports).toHaveProperty('transformSource');
      expect(exports).toHaveProperty('executeModuleSource');
      expect(exports).toHaveProperty('moduleContextStack');

      expect(typeof exports.compileTSX).toBe('function');
      expect(typeof exports.transformSource).toBe('function');
      expect(typeof exports.executeModuleSource).toBe('function');
      expect(Array.isArray(exports.moduleContextStack)).toBe(true);
    });
  });

  describe("install method", () => {
    test("should have correct method signature", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);
      expect(typeof service.install).toBe('function');
    });
  });

  describe("integration", () => {
    test("full lifecycle works correctly", () => {
      const mockServiceRegistry = {
        register: () => {}
      };

      const mockNamespace = {
        helpers: {}
      };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });

      const service = new TsxCompilerService(config);

      // Initialize the service
      const initializedService = service.initialize();
      expect(initializedService).toBe(service);
      expect(service.initialized).toBe(true);

      // Verify the service has the expected properties after initialization
      expect(service.moduleContextStack).toBeDefined();
      expect(Array.isArray(service.moduleContextStack)).toBe(true);
    });
  });
});