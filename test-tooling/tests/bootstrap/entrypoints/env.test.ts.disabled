const EnvInitializer = require("../../../../bootstrap/services/core/env-service.js");
const EnvInitializerConfig = require("../../../../bootstrap/configs/core/env.js");

describe("bootstrap/entrypoints/env.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.unmock("../../../../bootstrap/entrypoints/base-entrypoint.js");
  });

  it("constructs the base entrypoint with the EnvInitializer wiring", () => {
    let capturedArgs = null;
    const runSpy = jest.fn();

    jest.doMock("../../../../bootstrap/entrypoints/base-entrypoint.js", () => {
      return jest.fn().mockImplementation((args) => {
        capturedArgs = args;
        return { run: runSpy };
      });
    });

    jest.isolateModules(() => {
      require("../../../../bootstrap/entrypoints/env.js");
    });

    expect(capturedArgs.ServiceClass).toBe(EnvInitializer);
    expect(capturedArgs.ConfigClass).toBe(EnvInitializerConfig);
    expect(typeof capturedArgs.configFactory).toBe("function");
    expect(runSpy).toHaveBeenCalled();
  });

  it("maps the root handler into the EnvInitializer config", () => {
    let capturedArgs = null;

    jest.doMock("../../../../bootstrap/entrypoints/base-entrypoint.js", () => {
      return jest.fn().mockImplementation((args) => {
        capturedArgs = args;
        return { run: jest.fn() };
      });
    });

    jest.isolateModules(() => {
      require("../../../../bootstrap/entrypoints/env.js");
    });

    const config = capturedArgs.configFactory({ root: { env: true } });
    expect(config).toEqual({ global: { env: true } });
  });
});
