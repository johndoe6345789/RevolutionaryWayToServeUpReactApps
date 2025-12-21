const BaseHelper = require("../../../bootstrap/helpers/base-helper.js");

class TestHelper extends BaseHelper {
  initialize() {
    this.initialized = true;
    return this;
  }
}

describe("bootstrap/helpers/base-helper.js", () => {
  describe("constructor", () => {
    test("stores config and starts uninitialized", () => {
      const config = { name: "config" };
      const helper = new TestHelper(config);
      expect(helper.config).toBe(config);
      expect(helper.initialized).toBe(false);
    });

    test("defaults config to an empty object", () => {
      const helper = new TestHelper();
      expect(helper.config).toEqual({});
    });
  });

  describe("_resolveHelperRegistry", () => {
    test("returns the helper registry when present", () => {
      const registry = { name: "registry" };
      const helper = new TestHelper({ helperRegistry: registry });
      expect(helper._resolveHelperRegistry()).toBe(registry);
    });

    test("throws when helper registry is missing", () => {
      const helper = new TestHelper();
      expect(() => helper._resolveHelperRegistry()).toThrow(
        "HelperRegistry required for TestHelper"
      );
    });
  });

  describe("_registerHelper", () => {
    test("registers when name is not already taken", () => {
      const register = jest.fn();
      const registry = { isRegistered: jest.fn(() => false), register };
      const helper = new TestHelper({ helperRegistry: registry });

      helper._registerHelper("alpha", { name: "service" }, { folder: "helpers" });

      expect(registry.isRegistered).toHaveBeenCalledWith("alpha");
      expect(register).toHaveBeenCalledWith("alpha", { name: "service" }, { folder: "helpers" });
    });

    test("skips registration when already registered", () => {
      const register = jest.fn();
      const registry = { isRegistered: jest.fn(() => true), register };
      const helper = new TestHelper({ helperRegistry: registry });

      helper._registerHelper("alpha", { name: "service" });

      expect(registry.isRegistered).toHaveBeenCalledWith("alpha");
      expect(register).not.toHaveBeenCalled();
    });
  });

  describe("initialize", () => {
    test("throws when BaseHelper initialize is called directly", () => {
      const base = new BaseHelper();
      expect(() => base.initialize()).toThrow("BaseHelper must implement initialize()");
    });

    test("allows subclasses to implement initialize", () => {
      const helper = new TestHelper();
      const result = helper.initialize();
      expect(result).toBe(helper);
      expect(helper.initialized).toBe(true);
    });
  });
});
