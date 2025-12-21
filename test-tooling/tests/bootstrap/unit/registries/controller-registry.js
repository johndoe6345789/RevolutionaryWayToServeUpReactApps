const ControllerRegistry = require("../../../bootstrap/registries/controller-registry.js");

describe("bootstrap/registries/controller-registry.js", () => {
  describe("constructor", () => {
    test("starts with no controllers registered", () => {
      const registry = new ControllerRegistry();
      expect(registry.listControllers()).toEqual([]);
    });
  });

  describe("register", () => {
    test("stores a controller and metadata", () => {
      const registry = new ControllerRegistry();
      const controller = { name: "controller" };
      const metadata = { folder: "controllers" };

      registry.register("alpha", controller, metadata, []);

      expect(registry.getController("alpha")).toBe(controller);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new ControllerRegistry();
      expect(() => registry.register("", {}, {}, [])).toThrow("Controller name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new ControllerRegistry();
      registry.register("alpha", {}, {}, []);
      expect(() => registry.register("alpha", {}, {}, [])).toThrow("Controller already registered: alpha");
    });
    
    test("throws when not exactly 4 parameters provided", () => {
      const registry = new ControllerRegistry();
      expect(() => registry.register("test", {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", {}, {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", {}, {}, [], "extra")).toThrow("exactly 4 parameters");
    });
  });

  describe("getController", () => {
    test("returns undefined when no controller exists", () => {
      const registry = new ControllerRegistry();
      expect(registry.getController("missing")).toBeUndefined();
    });
  });

  describe("listControllers", () => {
    test("lists registered controller names", () => {
      const registry = new ControllerRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      expect(registry.listControllers()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new ControllerRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing controllers", () => {
      const registry = new ControllerRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears all registered controllers", () => {
      const registry = new ControllerRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      registry.reset();
      expect(registry.listControllers()).toEqual([]);
      expect(registry.isRegistered("alpha")).toBe(false);
    });
  });
});