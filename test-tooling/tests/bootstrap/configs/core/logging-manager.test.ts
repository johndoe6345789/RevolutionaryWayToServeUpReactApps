const LoggingManagerConfig = require("../../../../../bootstrap/configs/core/logging-manager.js");

describe("bootstrap/configs/core/logging-manager.js", () => {
  it("defaults to undefined logging hooks", () => {
    const config = new LoggingManagerConfig();
    expect(config.logClient).toBeUndefined();
    expect(config.serializeForLog).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
  });

  it("stores the provided logging hooks", () => {
    const logClient = jest.fn();
    const serializeForLog = jest.fn();
    const serviceRegistry = { register: jest.fn() };
    const config = new LoggingManagerConfig({ logClient, serializeForLog, serviceRegistry });

    expect(config.logClient).toBe(logClient);
    expect(config.serializeForLog).toBe(serializeForLog);
    expect(config.serviceRegistry).toBe(serviceRegistry);
  });
});
