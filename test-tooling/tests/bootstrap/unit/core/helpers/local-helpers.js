const LocalHelpersConfig = require("../../../../bootstrap/configs/helpers/local-helpers.js");

describe("bootstrap/configs/helpers/local-helpers.js", () => {
  describe("constructor", () => {
    test("stores helperRegistry when provided", () => {
      const registry = { name: "registry" };
      const config = new LocalHelpersConfig({ helperRegistry: registry });
      expect(config.helperRegistry).toBe(registry);
    });

    test("leaves helperRegistry undefined when omitted", () => {
      const config = new LocalHelpersConfig();
      expect(config.helperRegistry).toBeUndefined();
    });
  });
});
