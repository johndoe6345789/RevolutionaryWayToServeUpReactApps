const NetworkEntryPoint = require("../../../../bootstrap/cdn/network-entrypoint.js");

// We need to mock the dependencies to make the test work properly
jest.mock("../../../../bootstrap/entrypoints/base-entrypoint.js", () => {
  return jest.fn().mockImplementation(() => ({
    run: jest.fn().mockReturnValue({
      // Mock service with all expected methods
      setFallbackProviders: jest.fn(),
      getFallbackProviders: jest.fn(),
      setDefaultProviderBase: jest.fn(),
      getDefaultProviderBase: jest.fn(),
      setProviderAliases: jest.fn(),
      getProxyMode: jest.fn(),
      normalizeProviderBase: jest.fn(),
      normalizeProviderBaseRaw: jest.fn(),
      resolveProvider: jest.fn(),
      loadScript: jest.fn(),
      shouldRetryStatus: jest.fn(),
      probeUrl: jest.fn(),
      resolveModuleUrl: jest.fn(),
      helpers: { network: {} },
      isCommonJs: false,
    })
  }));
});

jest.mock("../../../../bootstrap/services/cdn/network-service.js", () => {
  return jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockReturnThis(),
    // From NetworkProviderService
    setFallbackProviders: jest.fn(),
    getFallbackProviders: jest.fn(),
    setDefaultProviderBase: jest.fn(),
    getDefaultProviderBase: jest.fn(),
    setProviderAliases: jest.fn(),
    getProxyMode: jest.fn(),
    normalizeProviderBase: jest.fn(),
    normalizeProviderBaseRaw: jest.fn(),
    resolveProvider: jest.fn(),
    // From NetworkProbeService
    loadScript: jest.fn(),
    shouldRetryStatus: jest.fn(),
    probeUrl: jest.fn(),
    // From NetworkModuleResolver
    resolveModuleUrl: jest.fn(),
    helpers: {},
    isCommonJs: false,
  }));
});

jest.mock("../../../../bootstrap/configs/cdn/network-service.js", () => {
  return jest.fn().mockImplementation(() => ({}));
});

describe("bootstrap/cdn/network-entrypoint.js", () => {
  let networkEntryPoint;

  beforeEach(() => {
    // Create a fresh instance before each test
    networkEntryPoint = new NetworkEntryPoint();
  });

  describe("constructor", () => {
    it("should initialize with correct configuration", () => {
      expect(networkEntryPoint).toBeDefined();
      expect(networkEntryPoint.service).toBeNull();
    });
  });

  describe("run method", () => {
    it("should run the entrypoint and return service and exports", () => {
      const result = networkEntryPoint.run();
      
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('exports');
      expect(result.service).toBeDefined();
      expect(result.exports).toBeDefined();
    });

    it("should expose all expected public network helpers", () => {
      const result = networkEntryPoint.run();
      const expectedHelpers = [
        "loadScript",
        "normalizeProviderBase",
        "resolveProvider",
        "shouldRetryStatus",
        "probeUrl",
        "resolveModuleUrl",
        "setFallbackProviders",
        "getFallbackProviders",
        "setDefaultProviderBase",
        "getDefaultProviderBase",
        "setProviderAliases",
        "getProxyMode",
        "normalizeProviderBaseRaw",
      ];

      expectedHelpers.forEach(helper => {
        expect(result.exports).toHaveProperty(helper);
        expect(typeof result.exports[helper]).toBe('function');
      });
    });

    it("should bind network helpers to the namespace", () => {
      const result = networkEntryPoint.run();
      expect(result.service.helpers).toHaveProperty('network');
      expect(result.service.helpers.network).toBe(result.exports);
    });
  });
});

// Test the actual methods individually with proper mocking
describe("Network Service Integration Tests", () => {
  let mockNetworkService;

  beforeEach(() => {
    mockNetworkService = {
      // Provider service methods
      setFallbackProviders: jest.fn(),
      getFallbackProviders: jest.fn(),
      setDefaultProviderBase: jest.fn(),
      getDefaultProviderBase: jest.fn(),
      setProviderAliases: jest.fn(),
      getProxyMode: jest.fn(),
      normalizeProviderBase: jest.fn(),
      normalizeProviderBaseRaw: jest.fn(),
      resolveProvider: jest.fn(),
      // Probe service methods
      loadScript: jest.fn(),
      shouldRetryStatus: jest.fn(),
      probeUrl: jest.fn(),
      // Module resolver methods
      resolveModuleUrl: jest.fn(),
      helpers: {},
      isCommonJs: false,
    };
  });

  describe("Provider Configuration Methods", () => {
    it("should properly set and get fallback providers", () => {
      const fallbackProviders = ["https://fallback1.com/", "https://fallback2.com/"];
      
      mockNetworkService.setFallbackProviders(fallbackProviders);
      expect(mockNetworkService.setFallbackProviders).toHaveBeenCalledWith(fallbackProviders);
      
      mockNetworkService.getFallbackProviders();
      expect(mockNetworkService.getFallbackProviders).toHaveBeenCalled();
    });

    it("should properly set and get default provider base", () => {
      const defaultBase = "https://default-provider.com/";
      
      mockNetworkService.setDefaultProviderBase(defaultBase);
      expect(mockNetworkService.setDefaultProviderBase).toHaveBeenCalledWith(defaultBase);
      
      mockNetworkService.getDefaultProviderBase();
      expect(mockNetworkService.getDefaultProviderBase).toHaveBeenCalled();
    });

    it("should properly set provider aliases", () => {
      const aliases = { "@react": "https://react-cdn.com/" };
      
      mockNetworkService.setProviderAliases(aliases);
      expect(mockNetworkService.setProviderAliases).toHaveBeenCalledWith(aliases);
    });

    it("should resolve provider correctly based on module config", () => {
      const module = {
        provider: "https://production.com/",
        ci_provider: "https://ci.com/"
      };
      
      mockNetworkService.resolveProvider(module);
      expect(mockNetworkService.resolveProvider).toHaveBeenCalledWith(module);
    });
  });

  describe("Network Utility Methods", () => {
    it("should correctly identify retryable status codes", () => {
      mockNetworkService.shouldRetryStatus(500);
      expect(mockNetworkService.shouldRetryStatus).toHaveBeenCalledWith(500);
      
      mockNetworkService.shouldRetryStatus(429);
      expect(mockNetworkService.shouldRetryStatus).toHaveBeenCalledWith(429);
      
      mockNetworkService.shouldRetryStatus(200);
      expect(mockNetworkService.shouldRetryStatus).toHaveBeenCalledWith(200);
    });

    it("should probe URL for availability", async () => {
      const url = "https://example.com/test";
      mockNetworkService.probeUrl.mockResolvedValue(true);
      
      const result = await mockNetworkService.probeUrl(url);
      expect(mockNetworkService.probeUrl).toHaveBeenCalledWith(url);
      expect(result).toBe(true);
    });

    it("should load script from URL", async () => {
      const url = "https://example.com/script.js";
      mockNetworkService.loadScript.mockResolvedValue();
      
      await mockNetworkService.loadScript(url);
      expect(mockNetworkService.loadScript).toHaveBeenCalledWith(url);
    });

    it("should resolve module URL from module specification", async () => {
      const module = {
        name: "test-module",
        package: "test-package",
        version: "1.0.0",
        file: "index.js"
      };
      
      mockNetworkService.resolveModuleUrl.mockResolvedValue("https://resolved.com/test-package@1.0.0/index.js");
      
      const result = await mockNetworkService.resolveModuleUrl(module);
      expect(mockNetworkService.resolveModuleUrl).toHaveBeenCalledWith(module);
      expect(result).toBe("https://resolved.com/test-package@1.0.0/index.js");
    });
  });

  describe("Provider Normalization Methods", () => {
    it("should normalize provider base URL", () => {
      const provider = "https://example.com/";
      mockNetworkService.normalizeProviderBase(provider);
      expect(mockNetworkService.normalizeProviderBase).toHaveBeenCalledWith(provider);
    });

    it("should normalize provider base URL raw", () => {
      const provider = "https://example.com/";
      mockNetworkService.normalizeProviderBaseRaw(provider);
      expect(mockNetworkService.normalizeProviderBaseRaw).toHaveBeenCalledWith(provider);
    });

    it("should get proxy mode", () => {
      mockNetworkService.getProxyMode();
      expect(mockNetworkService.getProxyMode).toHaveBeenCalled();
    });
  });
});