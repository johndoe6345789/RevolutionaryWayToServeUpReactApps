const LoggingServiceConfig = require("../../../../../bootstrap/configs/cdn/logging-service.js");

describe("bootstrap/configs/cdn/logging-service.js", () => {
  it("defaults to undefined logging configuration", () => {
    const config = new LoggingServiceConfig();
    expect(config.ciLogQueryParam).toBeUndefined();
    expect(config.clientLogEndpoint).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });

  it("stores provided logging configuration values", () => {
    const overrides = {
      ciLogQueryParam: "ci",
      clientLogEndpoint: "/logs",
      serviceRegistry: { register: jest.fn() },
      namespace: { helpers: {} },
    };
    const config = new LoggingServiceConfig(overrides);

    expect(config.ciLogQueryParam).toBe("ci");
    expect(config.clientLogEndpoint).toBe("/logs");
    expect(config.serviceRegistry).toBe(overrides.serviceRegistry);
    expect(config.namespace).toBe(overrides.namespace);
  });
});
