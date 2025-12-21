const EnvInitializer = require("../../../../../bootstrap/services/core/env-service.js");
const EnvConfig = require("../../../../../bootstrap/configs/core/env.js");

describe("bootstrap/services/core/env-service.js", () => {
  it("requires a global object before initialization", () => {
    const env = new EnvInitializer(new EnvConfig({ serviceRegistry: { register: jest.fn() } }));
    expect(() => env.initialize()).toThrow("Global object required for EnvInitializer");
  });

  it("requires a service registry before initialization", () => {
    const env = new EnvInitializer(new EnvConfig({ global: {} }));
    expect(() => env.initialize()).toThrow("ServiceRegistry required for EnvInitializer");
  });

  it("ensures proxy mode defaults to auto and registers itself", () => {
    const globalObj: Record<string, unknown> = {};
    const serviceRegistry = { register: jest.fn((name, service, metadata, requiredServices) => {}) };
    const env = new EnvInitializer(new EnvConfig({ global: globalObj, serviceRegistry }));

    const result = env.initialize();

    expect(globalObj.__RWTRA_PROXY_MODE__).toBe("auto");
    expect(serviceRegistry.register).toHaveBeenCalledWith(
      "env",
      env,
      expect.objectContaining({ folder: "services/core", domain: "core" }),
      []
    );
    expect(result).toBe(env);
  });

  it("does not override a proxy mode that was already set", () => {
    const globalObj = { __RWTRA_PROXY_MODE__: "proxy" };
    const serviceRegistry = { register: jest.fn((name, service, metadata, requiredServices) => {}) };
    const env = new EnvInitializer(new EnvConfig({ global: globalObj, serviceRegistry }));

    env.initialize();

    expect(globalObj.__RWTRA_PROXY_MODE__).toBe("proxy");
  });
});
