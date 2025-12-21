const fetchNamespaceSpy = jest.fn(async (_rule, icon, registry) => {
  const namespace = {
    __esModule: true,
    default: { icon, type: "dynamic-module" },
  };
  registry[`icons/${icon}`] = namespace;
  return namespace;
});

const resolveBasesSpy = jest.fn(() => ["https://cdn.example.com/"]);
const buildCandidatesSpy = jest.fn(() => ["https://cdn.example.com/icons/test.js"]);

jest.mock(
  "../../../../bootstrap/services/cdn/dynamic-modules/provider-resolver.js",
  () => {
    return class ProviderResolver {
      initialize() {
        return this;
      }

      resolveBases() {
        return resolveBasesSpy();
      }

      buildCandidates() {
        return buildCandidatesSpy();
      }
    };
  }
);

jest.mock(
  "../../../../bootstrap/services/cdn/dynamic-modules/module-fetcher.js",
  () => {
    return class ModuleFetcher {
      initialize() {
        return this;
      }

      async fetchNamespace(rule, icon, registry, urls) {
        return fetchNamespaceSpy(rule, icon, registry, urls);
      }
    };
  }
);

const DynamicModulesService = require("../../../../bootstrap/services/cdn/dynamic-modules-service.js");
const DynamicModulesConfig = require("../../../../bootstrap/configs/cdn/dynamic-modules.js");

describe("bootstrap/cdn/dynamic-modules-service.js", () => {
  const logging = { logClient: jest.fn(), serializeForLog: jest.fn() };
  const network = {
    loadScript: jest.fn(),
    normalizeProviderBase: jest.fn(() => "https://cdn.example.com/"),
    probeUrl: jest.fn(),
    getFallbackProviders: jest.fn(() => []),
    getDefaultProviderBase: jest.fn(() => ""),
    isCiLikeHost: jest.fn(() => false),
  };

  beforeEach(() => {
    fetchNamespaceSpy.mockClear();
    resolveBasesSpy.mockClear();
    buildCandidatesSpy.mockClear();
  });

  it("wraps values inside an ES module namespace", () => {
    const namespace = { helpers: {} };
    const serviceRegistry = { register: jest.fn() };
    const service = new DynamicModulesService(
      new DynamicModulesConfig({
        namespace,
        serviceRegistry,
        dependencies: { logging, network },
      })
    );
    const namespaceObject = service.createNamespace({ value: "payload" });
    expect(namespaceObject.__esModule).toBe(true);
    expect(namespaceObject.default).toEqual({ value: "payload" });
  });

  it("resolves dynamic modules through the resolver/fetcher pipeline", async () => {
    const namespace = { helpers: {} };
    const serviceRegistry = { register: jest.fn() };
    const service = new DynamicModulesService(
      new DynamicModulesConfig({
        namespace,
        serviceRegistry,
        dependencies: { logging, network },
      })
    );
    await service.initialize();

    const registry: Record<string, unknown> = {};
    const ruleConfig = { dynamicModules: [{ prefix: "icons/" }] };

    const dynamicNamespace = await service.loadDynamicModule("icons/test", ruleConfig, registry);

    expect(dynamicNamespace).toBe(registry["icons/test"]);
    expect(dynamicNamespace).toHaveProperty("default");
    expect(fetchNamespaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: "icons/" }),
      "test",
      registry,
      expect.arrayContaining(["https://cdn.example.com/icons/test.js"])
    );
    expect(resolveBasesSpy).toHaveBeenCalled();
    expect(buildCandidatesSpy).toHaveBeenCalled();
  });
});
