const LocalHelpersConfig = require("../../../../bootstrap/configs/helpers/local-helpers.js");

describe("bootstrap/configs/helpers/local-helpers.js", () => {
  it("retains the provided helper registry", () => {
    const registry = { register: jest.fn() };
    const config = new LocalHelpersConfig({ helperRegistry: registry });

    expect(config.helperRegistry).toBe(registry);
  });

  it("leaves the helper registry undefined when omitted", () => {
    const config = new LocalHelpersConfig();
    expect(config.helperRegistry).toBeUndefined();
  });
});
