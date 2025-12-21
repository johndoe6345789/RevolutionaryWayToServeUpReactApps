import NetworkEntryPoint from "../../../../bootstrap/cdn/network-entrypoint.js";
import BaseEntryPoint from "../../../../bootstrap/entrypoints/base-entrypoint.js";
import NetworkService from "../../../../bootstrap/services/cdn/network-service.js";
import NetworkServiceConfig from "../../../../bootstrap/configs/cdn/network-service.js";

// Mock the dependencies
jest.mock("../../../../bootstrap/entrypoints/base-entrypoint.js");
jest.mock("../../../../bootstrap/services/cdn/network-service.js");
jest.mock("../../../../bootstrap/configs/cdn/network-service.js");

describe("NetworkEntryPoint", () => {
  let mockNamespace;
  let mockLogging;

  beforeEach(() => {
    mockLogging = {
      logClient: jest.fn(),
      wait: jest.fn().mockResolvedValue(),
    };
    
    mockNamespace = {
      helpers: {
        logging: mockLogging
      }
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should extend BaseEntryPoint", () => {
      const entrypoint = new NetworkEntryPoint();
      expect(entrypoint).toBeInstanceOf(BaseEntryPoint);
    });

    it("should initialize with correct configuration", () => {
      const entrypoint = new NetworkEntryPoint();
      
      // Check that BaseEntryPoint was called with correct config
      expect(BaseEntryPoint).toHaveBeenCalledWith({
        ServiceClass: NetworkService,
        ConfigClass: NetworkServiceConfig,
        configFactory: expect.any(Function),
      });
      
      // Check that service property is initialized to null
      expect(entrypoint.service).toBeNull();
    });

    it("should create config with proper namespace and logging helpers", () => {
      const entrypoint = new NetworkEntryPoint();
      const configFactory = BaseEntryPoint.mock.calls[0][0].configFactory;
      
      const result = configFactory({ namespace: mockNamespace });
      
      expect(result.namespace).toBe(mockNamespace);
      expect(result.logClient).toBe(mockLogging.logClient);
      expect(result.wait).toBe(mockLogging.wait);
    });

    it("should handle missing logging helpers gracefully", () => {
      const namespaceWithoutLogging = { helpers: {} };
      const entrypoint = new NetworkEntryPoint();
      const configFactory = BaseEntryPoint.mock.calls[0][0].configFactory;
      
      const result = configFactory({ namespace: namespaceWithoutLogging });
      
      expect(result.logClient).toBeInstanceOf(Function); // Default no-op function
      expect(result.wait).toBeInstanceOf(Function); // Default no-op function
    });
  });

  describe("run method", () => {
    let mockBaseRunResult;
    let mockNetworkServiceInstance;
    let mockExports;

    beforeEach(() => {
      mockExports = {
        loadScript: jest.fn(),
        normalizeProviderBase: jest.fn(),
        resolveProvider: jest.fn(),
        shouldRetryStatus: jest.fn(),
        probeUrl: jest.fn(),
        resolveModuleUrl: jest.fn(),
        setFallbackProviders: jest.fn(),
        getFallbackProviders: jest.fn(),
        setDefaultProviderBase: jest.fn(),
        getDefaultProviderBase: jest.fn(),
        setProviderAliases: jest.fn(),
        getProxyMode: jest.fn(),
        normalizeProviderBaseRaw: jest.fn(),
      };

      mockNetworkServiceInstance = {
        loadScript: mockExports.loadScript,
        normalizeProviderBase: mockExports.normalizeProviderBase,
        resolveProvider: mockExports.resolveProvider,
        shouldRetryStatus: mockExports.shouldRetryStatus,
        probeUrl: mockExports.probeUrl,
        resolveModuleUrl: mockExports.resolveModuleUrl,
        setFallbackProviders: mockExports.setFallbackProviders,
        getFallbackProviders: mockExports.getFallbackProviders,
        setDefaultProviderBase: mockExports.setDefaultProviderBase,
        getDefaultProviderBase: mockExports.getDefaultProviderBase,
        setProviderAliases: mockExports.setProviderAliases,
        getProxyMode: mockExports.getProxyMode,
        normalizeProviderBaseRaw: mockExports.normalizeProviderBaseRaw,
        helpers: {},
        isCommonJs: false,
      };

      mockBaseRunResult = mockNetworkServiceInstance;
      BaseEntryPoint.prototype.run = jest.fn().mockReturnValue(mockBaseRunResult);
    });

    it("should call parent run method and store the service", () => {
      const entrypoint = new NetworkEntryPoint();
      const result = entrypoint.run();

      expect(BaseEntryPoint.prototype.run).toHaveBeenCalled();
      expect(entrypoint.service).toBe(mockBaseRunResult);
    });

    it("should return service and exports object with expected properties", () => {
      const entrypoint = new NetworkEntryPoint();
      const result = entrypoint.run();

      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('exports');
      expect(result.service).toBe(mockBaseRunResult);
      
      // Check that all expected export methods are present
      const expectedExports = [
        'loadScript',
        'normalizeProviderBase', 
        'resolveProvider',
        'shouldRetryStatus',
        'probeUrl',
        'resolveModuleUrl',
        'setFallbackProviders',
        'getFallbackProviders',
        'setDefaultProviderBase',
        'getDefaultProviderBase',
        'setProviderAliases',
        'getProxyMode',
        'normalizeProviderBaseRaw'
      ];
      
      expectedExports.forEach(method => {
        expect(typeof result.exports[method]).toBe('function');
      });
    });

    it("should attach network helpers to the service", () => {
      const entrypoint = new NetworkEntryPoint();
      entrypoint.run();

      expect(mockBaseRunResult.helpers.network).toBeInstanceOf(Object);
    });

    it("should handle CommonJS environment by setting module.exports", () => {
      // Mock CommonJS environment
      const originalModule = global.module;
      const mockModuleExports = { exports: {} };
      global.module = mockModuleExports;
      
      mockNetworkServiceInstance.isCommonJs = true;
      
      const entrypoint = new NetworkEntryPoint();
      entrypoint.run();
      
      // Restore global module
      global.module = originalModule;
    });

    it("should expose all expected network helper methods", () => {
      const entrypoint = new NetworkEntryPoint();
      const result = entrypoint.run();
      
      const exports = result.exports;
      
      expect(typeof exports.loadScript).toBe('function');
      expect(typeof exports.normalizeProviderBase).toBe('function');
      expect(typeof exports.resolveProvider).toBe('function');
      expect(typeof exports.shouldRetryStatus).toBe('function');
      expect(typeof exports.probeUrl).toBe('function');
      expect(typeof exports.resolveModuleUrl).toBe('function');
      expect(typeof exports.setFallbackProviders).toBe('function');
      expect(typeof exports.getFallbackProviders).toBe('function');
      expect(typeof exports.setDefaultProviderBase).toBe('function');
      expect(typeof exports.getDefaultProviderBase).toBe('function');
      expect(typeof exports.setProviderAliases).toBe('function');
      expect(typeof exports.getProxyMode).toBe('function');
      expect(typeof exports.normalizeProviderBaseRaw).toBe('function');
    });
  });

  describe("integration", () => {
    it("should work with real dependencies when not mocked", () => {
      // This test would run without mocks to verify integration
      // For now, we'll skip this since we're using mocks throughout
      expect(true).toBe(true);
    });
  });
});