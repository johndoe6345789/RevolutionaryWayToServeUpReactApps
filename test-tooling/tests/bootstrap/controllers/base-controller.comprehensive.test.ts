import BaseController from "../../../../bootstrap/controllers/base-controller.js";

describe("BaseController", () => {
  describe("constructor", () => {
    it("should initialize with empty config when no config provided", () => {
      const controller = new BaseController();
      expect(controller.config).toEqual({});
      expect(controller.initialized).toBe(false);
    });

    it("should initialize with provided config", () => {
      const config = { test: "value", option: true };
      const controller = new BaseController(config);
      expect(controller.config).toBe(config);
      expect(controller.initialized).toBe(false);
    });

    it("should initialize with empty object when null config provided", () => {
      const controller = new BaseController(null);
      expect(controller.config).toEqual({});
      expect(controller.initialized).toBe(false);
    });

    it("should initialize with empty object when undefined config provided", () => {
      const controller = new BaseController(undefined);
      expect(controller.config).toEqual({});
      expect(controller.initialized).toBe(false);
    });

    it("should initialize with complex config object", () => {
      const complexConfig = {
        nested: { value: "test" },
        array: [1, 2, 3],
        func: () => "test"
      };
      const controller = new BaseController(complexConfig);
      expect(controller.config).toBe(complexConfig);
      expect(controller.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw error when called on base class directly", () => {
      const controller = new BaseController();
      
      expect(() => controller.initialize()).toThrow(
        "BaseController must implement initialize()"
      );
    });

    it("should throw error with correct class name", () => {
      class CustomController extends BaseController {}
      const controller = new CustomController();
      
      expect(() => controller.initialize()).toThrow(
        "CustomController must implement initialize()"
      );
    });

    it("should not throw when implemented in subclass", () => {
      class ImplementedController extends BaseController {
        initialize() {
          this._markInitialized();
          return "initialized";
        }
      }
      const controller = new ImplementedController();
      
      expect(() => controller.initialize()).not.toThrow();
      expect(controller.initialize()).toBe("initialized");
      expect(controller.initialized).toBe(true);
    });

    it("should maintain initialized state after implementation", () => {
      class ImplementedController extends BaseController {
        initialize() {
          this._markInitialized();
          return this;
        }
      }
      const controller = new ImplementedController();
      controller.initialize();
      
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when controller is not initialized", () => {
      const controller = new BaseController();
      
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when controller is already initialized", () => {
      const controller = new BaseController();
      controller._markInitialized();
      
      expect(() => controller._ensureNotInitialized()).toThrow(
        "BaseController already initialized"
      );
    });

    it("should throw with correct class name", () => {
      class TestController extends BaseController {}
      const controller = new TestController();
      controller._markInitialized();
      
      expect(() => controller._ensureNotInitialized()).toThrow(
        "TestController already initialized"
      );
    });

    it("should work correctly after initialization sequence", () => {
      class TestController extends BaseController {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          return this;
        }
      }
      const controller = new TestController();
      
      // Should not throw before initialization
      expect(() => controller._ensureNotInitialized()).not.toThrow();
      
      controller.initialize();
      
      // Should throw after initialization
      expect(() => controller._ensureNotInitialized()).toThrow();
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized property to true", () => {
      const controller = new BaseController();
      expect(controller.initialized).toBe(false);
      
      controller._markInitialized();
      
      expect(controller.initialized).toBe(true);
    });

    it("should be callable multiple times (no protection against multiple calls)", () => {
      const controller = new BaseController();
      
      controller._markInitialized();
      expect(controller.initialized).toBe(true);
      
      controller._markInitialized();
      expect(controller.initialized).toBe(true);
    });

    it("should work with subclasses", () => {
      class TestController extends BaseController {}
      const controller = new TestController();
      
      expect(controller.initialized).toBe(false);
      controller._markInitialized();
      expect(controller.initialized).toBe(true);
    });

    it("should not affect other controller instances", () => {
      const controller1 = new BaseController();
      const controller2 = new BaseController();
      
      expect(controller1.initialized).toBe(false);
      expect(controller2.initialized).toBe(false);
      
      controller1._markInitialized();
      
      expect(controller1.initialized).toBe(true);
      expect(controller2.initialized).toBe(false);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when controller is not initialized", () => {
      const controller = new BaseController();
      
      expect(() => controller._ensureInitialized()).toThrow(
        "BaseController not initialized"
      );
    });

    it("should not throw when controller is initialized", () => {
      const controller = new BaseController();
      controller._markInitialized();
      
      expect(() => controller._ensureInitialized()).not.toThrow();
    });

    it("should throw with correct class name", () => {
      class TestController extends BaseController {}
      const controller = new TestController();
      
      expect(() => controller._ensureInitialized()).toThrow(
        "TestController not initialized"
      );
    });

    it("should work correctly after initialization", () => {
      class TestController extends BaseController {
        initialize() {
          this._markInitialized();
          return this;
        }
      }
      const controller = new TestController();
      
      // Should throw before initialization
      expect(() => controller._ensureInitialized()).toThrow();
      
      controller.initialize();
      
      // Should not throw after initialization
      expect(() => controller._ensureInitialized()).not.toThrow();
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with proper implementation", () => {
      class FullLifecycleController extends BaseController {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          this.someProperty = "initialized";
          return this;
        }
        
        doWork() {
          this._ensureInitialized();
          return this.someProperty;
        }
      }
      
      const controller = new FullLifecycleController();
      
      // Initially not initialized
      expect(controller.initialized).toBe(false);
      expect(() => controller.doWork()).toThrow();
      
      // After initialization
      const result = controller.initialize();
      expect(result).toBe(controller);
      expect(controller.initialized).toBe(true);
      expect(controller.doWork()).toBe("initialized");
    });

    it("should prevent double initialization", () => {
      class ProtectedController extends BaseController {
        initialize() {
          this._ensureNotInitialized();
          this._markInitialized();
          this.initializationCount = (this.initializationCount || 0) + 1;
          return this;
        }
      }
      
      const controller = new ProtectedController();
      controller.initialize();
      
      expect(() => controller.initialize()).toThrow("already initialized");
      expect(controller.initializationCount).toBe(1);
    });

    it("should enforce initialization before usage pattern", () => {
      class UsageController extends BaseController {
        initialize() {
          this._markInitialized();
          this.data = "ready";
          return this;
        }
        
        getData() {
          this._ensureInitialized();
          return this.data;
        }
      }
      
      const controller = new UsageController();
      
      // Should throw before initialization
      expect(() => controller.getData()).toThrow();
      
      // Should work after initialization
      controller.initialize();
      expect(controller.getData()).toBe("ready");
    });
  });

  describe("edge cases", () => {
    it("should handle inheritance correctly", () => {
      class ParentController extends BaseController {
        initialize() {
          this._markInitialized();
          this.parentInit = true;
          return this;
        }
      }
      
      class ChildController extends ParentController {
        initialize() {
          super.initialize();
          this.childInit = true;
          return this;
        }
      }
      
      const controller = new ChildController();
      controller.initialize();
      
      expect(controller.parentInit).toBe(true);
      expect(controller.childInit).toBe(true);
      expect(controller.initialized).toBe(true);
    });

    it("should handle multiple inheritance levels", () => {
      class Level1 extends BaseController {
        initialize() {
          this._markInitialized();
          this.level1 = true;
          return this;
        }
      }
      
      class Level2 extends Level1 {
        initialize() {
          super.initialize();
          this.level2 = true;
          return this;
        }
      }
      
      class Level3 extends Level2 {
        initialize() {
          super.initialize();
          this.level3 = true;
          return this;
        }
      }
      
      const controller = new Level3();
      controller.initialize();
      
      expect(controller.level1).toBe(true);
      expect(controller.level2).toBe(true);
      expect(controller.level3).toBe(true);
      expect(controller.initialized).toBe(true);
    });

    it("should preserve config through inheritance", () => {
      class TestController extends BaseController {}
      
      const config = { custom: "config", value: 42 };
      const controller = new TestController(config);
      
      expect(controller.config).toBe(config);
      controller._markInitialized();
      expect(controller.config).toBe(config);
    });

    it("should handle initialization error recovery", () => {
      class FailingController extends BaseController {
        initialize() {
          this._ensureNotInitialized();
          throw new Error("Initialization failed");
        }
      }
      
      const controller = new FailingController();
      expect(controller.initialized).toBe(false);
      
      // Should remain not initialized after failed attempt
      expect(() => controller.initialize()).toThrow("Initialization failed");
      expect(controller.initialized).toBe(false);
      
      // The _ensureNotInitialized should still work (since init failed)
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });
  });
});