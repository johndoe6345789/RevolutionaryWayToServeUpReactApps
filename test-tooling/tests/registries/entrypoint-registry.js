const EntrypointRegistry = require("../../../bootstrap/registries/entrypoint-registry.js");

describe("bootstrap/registries/entrypoint-registry.js", () => {
  describe("constructor", () => {
    test("starts with no entrypoints registered", () => {
      const registry = new EntrypointRegistry();
      expect(registry.listEntrypoints()).toEqual([]);
    });
  });

  describe("register", () => {
    test("stores an entrypoint and metadata", () => {
      const registry = new EntrypointRegistry();
      const entrypoint = { name: "entrypoint" };
      const metadata = { folder: "entrypoints" };

      registry.register("alpha", entrypoint, metadata, []);

      expect(registry.getEntrypoint("alpha")).toBe(entrypoint);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new EntrypointRegistry();
      expect(() => registry.register("", {}, {}, [])).toThrow("Entrypoint name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new EntrypointRegistry();
      registry.register("alpha", {}, {}, []);
      expect(() => registry.register("alpha", {}, {}, [])).toThrow("Entrypoint already registered: alpha");
    });
    
    test("throws when not exactly 4 parameters provided", () => {
      const registry = new EntrypointRegistry();
      expect(() => registry.register("test", {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", {}, {})).toThrow("exactly 4 parameters");
      expect(() => registry.register("test", {}, {}, [], "extra")).toThrow("exactly 4 parameters");
    });
  });

  describe("getEntrypoint", () => {
    test("returns undefined when no entrypoint exists", () => {
      const registry = new EntrypointRegistry();
      expect(registry.getEntrypoint("missing")).toBeUndefined();
    });
  });

  describe("listEntrypoints", () => {
    test("lists registered entrypoint names", () => {
      const registry = new EntrypointRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      expect(registry.listEntrypoints()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new EntrypointRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing entrypoints", () => {
      const registry = new EntrypointRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears all registered entrypoints", () => {
      const registry = new EntrypointRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      registry.reset();
      expect(registry.listEntrypoints()).toEqual([]);
      expect(registry.isRegistered("alpha")).toBe(false);
    });
  });
});