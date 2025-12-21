// Comprehensive test suite for NetworkServiceConfig class
// This replaces the generic stub tests with proper method-specific tests

const NetworkServiceConfig = require("../../../../../bootstrap/configs/cdn/network-service.js");

describe("NetworkServiceConfig", () => {
  test("constructor creates an instance with default values", () => {
    const config = new NetworkServiceConfig();

    expect(config).toBeInstanceOf(NetworkServiceConfig);
    expect(config.logClient).toBeUndefined();
    expect(config.wait).toBeUndefined();
    expect(config.namespace).toBeUndefined();
    expect(config.providerConfig).toBeUndefined();
    expect(config.probeConfig).toBeUndefined();
    expect(config.moduleResolverConfig).toBeUndefined();
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor accepts and stores all configuration options", () => {
    const mockLogClient = () => {};
    const mockWait = () => {};
    const mockNamespace = { helpers: {} };
    const mockProviderConfig = { providers: [] };
    const mockProbeConfig = { timeout: 10 };
    const mockModuleResolverConfig = { maxRetries: 2 };

    const config = new NetworkServiceConfig({
      logClient: mockLogClient,
      wait: mockWait,
      namespace: mockNamespace,
      providerConfig: mockProviderConfig,
      probeConfig: mockProbeConfig,
      moduleResolverConfig: mockModuleResolverConfig,
      isCommonJs: true
    });

    expect(config.logClient).toBe(mockLogClient);
    expect(config.wait).toBe(mockWait);
    expect(config.namespace).toBe(mockNamespace);
    expect(config.providerConfig).toBe(mockProviderConfig);
    expect(config.probeConfig).toBe(mockProbeConfig);
    expect(config.moduleResolverConfig).toBe(mockModuleResolverConfig);
    expect(config.isCommonJs).toBe(true);
  });

  test("constructor handles partial configuration options", () => {
    const mockLogClient = () => {};
    const mockNamespace = { helpers: {} };

    const config = new NetworkServiceConfig({
      logClient: mockLogClient,
      namespace: mockNamespace
    });

    expect(config.logClient).toBe(mockLogClient);
    expect(config.namespace).toBe(mockNamespace);
    expect(config.wait).toBeUndefined();
    expect(config.providerConfig).toBeUndefined();
    expect(config.probeConfig).toBeUndefined();
    expect(config.moduleResolverConfig).toBeUndefined();
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor defaults isCommonJs to module environment when not provided", () => {
    // Check the default behavior without modifying global state
    const config = new NetworkServiceConfig({});
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor respects explicit isCommonJs value", () => {
    const config1 = new NetworkServiceConfig({ isCommonJs: true });
    expect(config1.isCommonJs).toBe(true);

    const config2 = new NetworkServiceConfig({ isCommonJs: false });
    expect(config2.isCommonJs).toBe(false);
  });

  test("constructor handles null and undefined values in configuration", () => {
    const config = new NetworkServiceConfig({
      logClient: null,
      wait: null,
      namespace: null,
      providerConfig: null,
      probeConfig: null,
      moduleResolverConfig: null
    });

    expect(config.logClient).toBeNull();
    expect(config.wait).toBeNull();
    expect(config.namespace).toBeNull();
    expect(config.providerConfig).toBeNull();
    expect(config.probeConfig).toBeNull();
    expect(config.moduleResolverConfig).toBeNull();
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor handles primitive values in configuration", () => {
    const config = new NetworkServiceConfig({
      logClient: "function",
      wait: 42,
      namespace: "namespace",
      providerConfig: "providers",
      probeConfig: 100,
      moduleResolverConfig: "resolver"
    });

    expect(config.logClient).toBe("function");
    expect(config.wait).toBe(42);
    expect(config.namespace).toBe("namespace");
    expect(config.providerConfig).toBe("providers");
    expect(config.probeConfig).toBe(100);
    expect(config.moduleResolverConfig).toBe("resolver");
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor accepts complex nested objects in configuration", () => {
    const complexConfig = {
      providerConfig: {
        providers: [
          { name: "provider1", url: "https://example.com" },
          { name: "provider2", url: "https://example2.com" }
        ],
        aliases: {
          "@react": "https://cdn.skypack.dev/react",
          "@vue": "https://cdn.skypack.dev/vue"
        }
      },
      probeConfig: {
        timeout: 5000,
        retries: 3,
        headers: { "Content-Type": "application/json" }
      }
    };

    const config = new NetworkServiceConfig(complexConfig);

    expect(config.providerConfig).toEqual(complexConfig.providerConfig);
    expect(config.probeConfig).toEqual(complexConfig.probeConfig);
    expect(typeof config.isCommonJs).toBe('boolean');
  });

  test("constructor maintains reference equality for objects", () => {
    const sharedObject = { shared: "data" };
    const config = new NetworkServiceConfig({
      namespace: sharedObject,
      providerConfig: sharedObject
    });

    expect(config.namespace).toBe(sharedObject);
    expect(config.providerConfig).toBe(sharedObject);
  });

  test("integration: works with realistic network service configuration", () => {
    const realisticConfig = {
      logClient: (event, data) => console.log(event, data),
      wait: (time) => new Promise(resolve => setTimeout(resolve, time)),
      namespace: { helpers: { network: {} } },
      providerConfig: {
        fallbackProviders: ["https://cdn1.example.com/", "https://cdn2.example.com/"],
        defaultProviderBase: "https://default.example.com/",
        providerAliases: { "@std": "https://deno.land/std@" }
      },
      probeConfig: {
        timeout: 5000,
        retryDelay: 1000,
        maxRetries: 3
      },
      moduleResolverConfig: {
        maxRetries: 2,
        retryDelay: 500
      },
      isCommonJs: false
    };

    const config = new NetworkServiceConfig(realisticConfig);

    expect(config.logClient).toBe(realisticConfig.logClient);
    expect(config.wait).toBe(realisticConfig.wait);
    expect(config.namespace).toBe(realisticConfig.namespace);
    expect(config.providerConfig).toBe(realisticConfig.providerConfig);
    expect(config.probeConfig).toBe(realisticConfig.probeConfig);
    expect(config.moduleResolverConfig).toBe(realisticConfig.moduleResolverConfig);
    expect(config.isCommonJs).toBe(realisticConfig.isCommonJs);
  });
});