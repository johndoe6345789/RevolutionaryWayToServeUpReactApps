const helperRegistryInstance = require("../../../bootstrap/helpers/helper-registry-instance.js");
const LocalHelpers = require("../../../bootstrap/helpers/local-helpers.js");
const LocalHelpersConfig = require("../../../bootstrap/configs/helpers/local-helpers.js");

describe("bootstrap/helpers/local-helpers.js", () => {
  describe("constructor", () => {
    test("defaults helperRegistry to the shared instance", () => {
      const helpers = new LocalHelpers();
      expect(helpers.config.helperRegistry).toBe(helperRegistryInstance);
    });

    test("uses a provided helperRegistry when supplied", () => {
      const registry = { name: "registry" };
      const config = new LocalHelpersConfig({ helperRegistry: registry });
      const helpers = new LocalHelpers(config);
      expect(helpers.config.helperRegistry).toBe(registry);
    });
  });

  describe("initialize", () => {
    test("registers the framework and require builder helpers", () => {
      const registry = { isRegistered: jest.fn(() => false), register: jest.fn() };
      const config = new LocalHelpersConfig({ helperRegistry: registry });
      const helpers = new LocalHelpers(config);

      const result = helpers.initialize();

      expect(result).toBe(helpers);
      expect(registry.isRegistered).toHaveBeenCalledWith("frameworkRenderer");
      expect(registry.isRegistered).toHaveBeenCalledWith("localRequireBuilder");
      expect(registry.register).toHaveBeenCalledTimes(2);
      expect(helpers.initialized).toBe(true);
    });

    test("skips registering when already initialized", () => {
      const registry = { isRegistered: jest.fn(() => false), register: jest.fn() };
      const config = new LocalHelpersConfig({ helperRegistry: registry });
      const helpers = new LocalHelpers(config);
      helpers.initialized = true;

      const result = helpers.initialize();

      expect(result).toBe(helpers);
      expect(registry.register).not.toHaveBeenCalled();
    });
  });
});
