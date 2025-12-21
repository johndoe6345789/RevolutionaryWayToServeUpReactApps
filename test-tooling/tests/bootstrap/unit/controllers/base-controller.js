const BaseController = require("../../../bootstrap/controllers/base-controller.js");

class TestController extends BaseController {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    return this;
  }
}

describe("bootstrap/controllers/base-controller.js", () => {
  describe("constructor", () => {
    test("stores config and starts uninitialized", () => {
      const config = { name: "config" };
      const controller = new TestController(config);
      expect(controller.config).toBe(config);
      expect(controller.initialized).toBe(false);
    });

    test("defaults config to an empty object", () => {
      const controller = new TestController();
      expect(controller.config).toEqual({});
    });
  });

  describe("initialize", () => {
    test("throws when BaseController initialize is called directly", () => {
      const controller = new BaseController();
      expect(() => controller.initialize()).toThrow(
        "BaseController must implement initialize()"
      );
    });

    test("marks the subclass as initialized", () => {
      const controller = new TestController();
      const result = controller.initialize();
      expect(result).toBe(controller);
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized", () => {
    test("allows first initialization", () => {
      const controller = new TestController();
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });

    test("throws when already initialized", () => {
      const controller = new TestController();
      controller._markInitialized();
      expect(() => controller._ensureNotInitialized()).toThrow(
        "TestController already initialized"
      );
    });
  });

  describe("_markInitialized", () => {
    test("sets initialized to true", () => {
      const controller = new TestController();
      controller._markInitialized();
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized", () => {
    test("throws before initialization", () => {
      const controller = new TestController();
      expect(() => controller._ensureInitialized()).toThrow(
        "TestController not initialized"
      );
    });

    test("does not throw after initialization", () => {
      const controller = new TestController();
      controller._markInitialized();
      expect(() => controller._ensureInitialized()).not.toThrow();
    });
  });
});
