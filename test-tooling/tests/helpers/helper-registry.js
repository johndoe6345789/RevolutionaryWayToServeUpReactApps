const HelperRegistry = require("../../../bootstrap/helpers/helper-registry.js");

describe("bootstrap/helpers/helper-registry.js", () => {
  describe("constructor", () => {
    test("starts with no helpers registered", () => {
      const registry = new HelperRegistry();
      expect(registry.listHelpers()).toEqual([]);
    });
  });

  describe("register", () => {
    test("stores a helper and metadata", () => {
      const registry = new HelperRegistry();
      const helper = { name: "helper" };
      const metadata = { folder: "helpers" };

      registry.register("alpha", helper, metadata, []);

      expect(registry.getHelper("alpha")).toBe(helper);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new HelperRegistry();
      expect(() => registry.register("", {}, {}, [])).toThrow("Helper name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new HelperRegistry();
      registry.register("alpha", {}, {}, []);
      expect(() => registry.register("alpha", {}, {}, [])).toThrow("Helper already registered: alpha");
    });
  });

  describe("getHelper", () => {
    test("returns undefined when no helper exists", () => {
      const registry = new HelperRegistry();
      expect(registry.getHelper("missing")).toBeUndefined();
    });
  });

  describe("listHelpers", () => {
    test("lists registered helper names", () => {
      const registry = new HelperRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      expect(registry.listHelpers()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new HelperRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing helpers", () => {
      const registry = new HelperRegistry();
      registry.register("alpha", {});
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });
});
