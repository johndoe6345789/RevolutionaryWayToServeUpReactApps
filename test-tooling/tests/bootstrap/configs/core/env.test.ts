const EnvInitializerConfig = require("../../../../../bootstrap/configs/core/env.js");

describe("bootstrap/configs/core/env.js", () => {
  it("leaves properties undefined by default", () => {
    const config = new EnvInitializerConfig();
    expect(config.global).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
  });

  it("stores the provided global and service registry", () => {
    const globalObj = {};
    const serviceRegistry = { register: jest.fn() };
    const config = new EnvInitializerConfig({ global: globalObj, serviceRegistry });

    expect(config.global).toBe(globalObj);
    expect(config.serviceRegistry).toBe(serviceRegistry);
  });
});
