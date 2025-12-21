const LocalRequireBuilderConfig = require("../../../../bootstrap/configs/local/local-require-builder.js");

describe("bootstrap/configs/local/local-require-builder.js", () => {
  it("captures the helper registry that was provided", () => {
    const helperRegistry = { resolve: jest.fn() };
    const config = new LocalRequireBuilderConfig({ helperRegistry });

    expect(config.helperRegistry).toBe(helperRegistry);
  });

  it("leaves the helper registry undefined when omitted", () => {
    const config = new LocalRequireBuilderConfig();
    expect(config.helperRegistry).toBeUndefined();
  });
});
