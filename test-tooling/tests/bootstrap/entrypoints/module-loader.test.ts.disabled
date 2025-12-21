const ModuleLoaderAggregator = require("../../../../bootstrap/services/core/module-loader-service.js");
const ModuleLoaderConfig = require("../../../../bootstrap/configs/core/module-loader.js");

describe("bootstrap/entrypoints/module-loader.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.unmock("../../../../bootstrap/entrypoints/base-entrypoint.js");
  });

  it("exports the module loader helpers from the entrypoint", () => {
    const exportsPayload = { loadTools: jest.fn() };
    const runSpy = jest.fn(() => ({ exports: exportsPayload }));
    let capturedArgs = null;

    jest.doMock("../../../../bootstrap/entrypoints/base-entrypoint.js", () => {
      return jest.fn().mockImplementation((args) => {
        capturedArgs = args;
        return { run: runSpy };
      });
    });

    let moduleLoaderExports;
    jest.isolateModules(() => {
      moduleLoaderExports = require("../../../../bootstrap/entrypoints/module-loader.js");
    });

    expect(capturedArgs.ServiceClass).toBe(ModuleLoaderAggregator);
    expect(capturedArgs.ConfigClass).toBe(ModuleLoaderConfig);
    expect(moduleLoaderExports).toBe(exportsPayload);
    expect(runSpy).toHaveBeenCalled();
  });

  it("maps the root handler into the module loader config", () => {
    let capturedArgs = null;

    jest.doMock("../../../../bootstrap/entrypoints/base-entrypoint.js", () => {
      return jest.fn().mockImplementation((args) => {
        capturedArgs = args;
        return { run: jest.fn(() => ({ exports: {} })) };
      });
    });

    jest.isolateModules(() => {
      require("../../../../bootstrap/entrypoints/module-loader.js");
    });

    const config = capturedArgs.configFactory({ root: { env: "root" } });
    expect(config).toEqual({ environmentRoot: { env: "root" } });
  });
});
