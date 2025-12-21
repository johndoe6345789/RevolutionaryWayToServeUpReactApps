const BaseController = require("../../../../bootstrap/controllers/base-controller.js");

describe("bootstrap/controllers/base-controller.js", () => {
  class TestController extends BaseController {
    initialize() {
      this._ensureNotInitialized();
      this._markInitialized();
    }
  }

  it("throws when the base implementation is used directly", () => {
    const controller = new BaseController();
    expect(() => controller.initialize()).toThrow("BaseController must implement initialize()");
  });

  it("tracks initialization state via _markInitialized", () => {
    const controller = new TestController();
    expect(controller.initialized).toBe(false);
    controller._markInitialized();
    expect(controller.initialized).toBe(true);
  });

  it("prevents repeated initialization attempts", () => {
    const controller = new TestController();
    controller._markInitialized();
    expect(() => controller._ensureNotInitialized()).toThrow("TestController already initialized");
  });

  it("requires initialization before usage", () => {
    const controller = new TestController();
    expect(() => controller._ensureInitialized()).toThrow("TestController not initialized");
    controller._markInitialized();
    expect(() => controller._ensureInitialized()).not.toThrow();
  });
});
