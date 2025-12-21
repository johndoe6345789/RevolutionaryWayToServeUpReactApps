const ToolsLoaderService = require("../../../../bootstrap/services/cdn/tools-service.js");

describe("bootstrap/services/cdn/tools-service.js", () => {
  let service;
  let mockLoadScript;
  let mockResolveModuleUrl;
  let network;
  let logging;
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
    globalThis.window = {};
    mockLoadScript = jest.fn(() => Promise.resolve());
    mockResolveModuleUrl = jest.fn(() => Promise.resolve("https://cdn.tools/tool.js"));
    network = {
      loadScript: mockLoadScript,
      resolveModuleUrl: mockResolveModuleUrl,
    };
    logging = { logClient: jest.fn() };
    service = new ToolsLoaderService({
      namespace: { helpers: {} },
      serviceRegistry: { register: jest.fn() },
      dependencies: { logging, network },
    });
    service.initialize();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("creates namespaces from legacy globals", () => {
    const globalObj = { method: () => "test", helper: true };
    const ns = service.makeNamespace(globalObj);
    expect(ns.__esModule).toBe(true);
    expect(ns.default).toBe(globalObj);
    expect(ns.method).toBe(globalObj.method);
    expect(ns.helper).toBe(true);
  });

  it("loads configured tools and logs successes", async () => {
    const tool = { name: "widget", global: "WidgetGlobal" };
    mockLoadScript.mockImplementation(() => {
      globalThis.window = globalThis.window || {};
      globalThis.window[tool.global] = { default: "ready" };
      return Promise.resolve();
    });

    await expect(service.loadTools([tool])).resolves.toHaveLength(1);
    expect(mockResolveModuleUrl).toHaveBeenCalledWith(tool);
    expect(logging.logClient).toHaveBeenCalled();
  });

  it("loads global modules and exposes namespaces", async () => {
    const mod = { name: "module", global: "ModuleGlobal" };
    mockLoadScript.mockImplementation(() => {
      globalThis.window = globalThis.window || {};
      globalThis.window[mod.global] = { default: "module" };
      return Promise.resolve();
    });

    const registry = await service.loadModules([mod]);
    expect(mockResolveModuleUrl).toHaveBeenCalledWith(mod);
    expect(registry.module).toBeDefined();
    expect(registry.module.__esModule).toBe(true);
  });
});
