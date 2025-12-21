const NetworkProbeServiceConfig = require("../../../../../bootstrap/configs/cdn/network-probe-service.js");

describe("bootstrap/configs/cdn/network-probe-service.js", () => {
  it("defaults to a global object and no-op helpers", async () => {
    const config = new NetworkProbeServiceConfig();
    expect(config.globalObject).toBeDefined();
    expect(typeof config.logClient).toBe("function");
    expect(typeof config.wait).toBe("function");
    await expect(config.wait()).resolves.toBeUndefined();
  });

  it("stores provided globals and helpers", () => {
    const globalObject = { document: {} };
    const logClient = jest.fn();
    const wait = jest.fn(() => Promise.resolve("done"));
    const config = new NetworkProbeServiceConfig({ globalObject, logClient, wait });

    expect(config.globalObject).toBe(globalObject);
    expect(config.logClient).toBe(logClient);
    expect(config.wait).toBe(wait);
  });
});
