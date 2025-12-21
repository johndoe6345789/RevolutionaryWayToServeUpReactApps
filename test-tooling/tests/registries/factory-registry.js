const FactoryRegistry = require("../../../bootstrap/registries/factory-registry.js");

describe("bootstrap/registries/factory-registry.js", () => {
  describe("constructor", () => {
    test("starts with no factories registered", () => {
      const registry = new FactoryRegistry();
      expect(registry.listFactories()).toEqual([]);
    });
  });

  describe("register", () => {
    test("stores a factory and metadata", () => {
      const registry = new FactoryRegistry();
      const factory = function() {};
      const metadata = { folder: "factories" };

      registry.register("alpha", factory, metadata, []);

      expect(registry.getFactory("alpha")).toBe(factory);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new FactoryRegistry();
      expect(() => registry.register("", () => {}, {}, [])).toThrow("Factory name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new FactoryRegistry();
      registry.register("alpha", () => {}, {}, []);
      expect(() => registry.register("alpha", () => {}, {}, [])).toThrow("Factory already registered: alpha");
    });
    
    test("throws when not exactly 4 parameters provided", () => {
      const registry = new FactoryRegistry();
      expect(() => registry.register("test", () => {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", () => {}, {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", () => {}, {}, [], "extra")).toThrow("exactly 4 parameters");
    });
  });

  describe("create", () => {
    test("creates an instance using the registered factory", () => {
      const registry = new FactoryRegistry();

      class TestClass {
        constructor(deps) {
          this.deps = deps;
        }
      }

      class TestFactory {
        constructor(deps) {
          this.dependencies = deps;
        }

        create(config) {
          return new TestClass(config);
        }
      }

      registry.register("testFactory", TestFactory, {}, []);

      const instance = registry.create("testFactory", { service: "test" });
      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.deps.service).toBe("test");
    });

    test("throws when factory is not found", () => {
      const registry = new FactoryRegistry();
      expect(() => registry.create("missing")).toThrow("Factory not found: missing");
    });

    test("validates required dependencies", () => {
      const registry = new FactoryRegistry();

      class TestClass {
        constructor(deps) {
          this.deps = deps;
        }
      }

      class TestFactory {
        constructor(deps) {
          this.dependencies = deps;
        }

        create(config) {
          return new TestClass(config);
        }
      }

      registry.register("testFactory", TestFactory, { required: ["service"] }, []);

      expect(() => registry.create("testFactory", {}))
        .toThrow("Required dependency missing for factory testFactory: service");

      expect(() => registry.create("testFactory", { service: "test" }))
        .not.toThrow();
    });
  });

  describe("getFactory", () => {
    test("returns undefined when no factory exists", () => {
      const registry = new FactoryRegistry();
      expect(registry.getFactory("missing")).toBeUndefined();
    });
  });

  describe("listFactories", () => {
    test("lists registered factory names", () => {
      const registry = new FactoryRegistry();
      registry.register("alpha", () => {}, {}, []);
      registry.register("beta", () => {}, {}, []);
      expect(registry.listFactories()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new FactoryRegistry();
      registry.register("alpha", () => {}, {}, []);
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing factories", () => {
      const registry = new FactoryRegistry();
      registry.register("alpha", () => {}, {}, []);
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears all registered factories", () => {
      const registry = new FactoryRegistry();
      registry.register("alpha", () => {}, {}, []);
      registry.register("beta", () => {}, {}, []);
      registry.reset();
      expect(registry.listFactories()).toEqual([]);
      expect(registry.isRegistered("alpha")).toBe(false);
    });
  });
});