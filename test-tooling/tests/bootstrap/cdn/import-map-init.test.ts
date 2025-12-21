const ImportMapInitializer = require("../../../../bootstrap/services/cdn/import-map-init-service.js");
const ImportMapInitConfig = require("../../../../bootstrap/configs/cdn/import-map-init.js");

describe("bootstrap/services/cdn/import-map-init-service.js", () => {
  it("skips initialization when no window is available", async () => {
    const service = new ImportMapInitializer(
      new ImportMapInitConfig({
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        window: null,
        fetch: null,
      })
    );
    await expect(service.initialize()).resolves.toBe(service);
  });

  it("populates the import map with resolved URLs and applies provider overrides", async () => {
    const scriptElement = { textContent: "" };
    const networkHelper = {
      resolveModuleUrl: jest.fn(async () => "https://cdn.example.com/modules/icon.js"),
      setFallbackProviders: jest.fn(),
      setDefaultProviderBase: jest.fn(),
      setProviderAliases: jest.fn(),
    };
    const window = {
      document: { querySelector: jest.fn(() => scriptElement) },
      __rwtraBootstrap: { helpers: { network: networkHelper } },
    };
    const configPayload = {
      fallbackProviders: ["https://fallback.example.com/"],
      providers: { default: "https://default.example.com/", aliases: { alias: "https://alias.example.com/" } },
      modules: [
        { name: "icons/test", importSpecifiers: ["@mui/icons-material/Test"] },
        { name: "tools/helper", url: "https://cdn.example.com/tools/helper.js", importSpecifiers: [] },
      ],
    };
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => configPayload,
    }));

    const service = new ImportMapInitializer(
      new ImportMapInitConfig({
        namespace: { helpers: {} },
        serviceRegistry: { register: jest.fn() },
        window,
        fetch: fetchMock,
      })
    );

    await expect(service.initialize()).resolves.toBe(service);
    expect(networkHelper.setFallbackProviders).toHaveBeenCalledWith(configPayload.fallbackProviders);
    expect(networkHelper.setDefaultProviderBase).toHaveBeenCalledWith(configPayload.providers.default);
    expect(networkHelper.setProviderAliases).toHaveBeenCalledWith(configPayload.providers.aliases);
    expect(window.__rwtraConfig).toEqual(configPayload);
    expect(window.__rwtraConfigPromise).toBeDefined();

    const parsedImports = JSON.parse(scriptElement.textContent);
    expect(parsedImports.imports["@mui/icons-material/Test"]).toBe("https://cdn.example.com/modules/icon.js");
    expect(parsedImports.imports["tools/helper"]).toBe("https://cdn.example.com/tools/helper.js");
  });
});
