import HelperRegistry from "../../../../bootstrap/helpers/helper-registry.js";

describe("HelperRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new HelperRegistry();
  });

  describe("constructor", () => {
    it("should initialize with an empty helpers map", () => {
      expect(registry._helpers).toBeInstanceOf(Map);
      expect(registry._helpers.size).toBe(0);
    });

    it("should create a new map instance for each registry", () => {
      const registry2 = new HelperRegistry();
      expect(registry._helpers).not.toBe(registry2._helpers);
    });
  });

  describe("register method", () => {
    it("should register a helper with name, helper instance, and metadata", () => {
      const helper = { ping: () => "pong" };
      const metadata = { scope: "runtime", version: 2 };

      registry.register("core:health", helper, metadata);

      expect(registry.getHelper("core:health")).toBe(helper);
      expect(registry.getMetadata("core:health")).toBe(metadata);
    });

    it("should register a helper with default empty metadata when not provided", () => {
      const helper = { ping: () => "pong" };

      registry.register("core:health", helper);

      expect(registry.getHelper("core:health")).toBe(helper);
      expect(registry.getMetadata("core:health")).toEqual({});
    });

    it("should throw an error when no name is provided", () => {
      const helper = { ping: () => "pong" };

      expect(() => registry.register("", helper)).toThrow("Helper name is required");
      expect(() => registry.register(null, helper)).toThrow("Helper name is required");
      expect(() => registry.register(undefined, helper)).toThrow("Helper name is required");
      expect(() => registry.register(0, helper)).toThrow("Helper name is required");
      expect(() => registry.register(false, helper)).toThrow("Helper name is required");
    });

    it("should throw an error when helper is already registered", () => {
      const helper1 = { ping: () => "pong" };
      const helper2 = { pong: () => "ping" };

      registry.register("core:health", helper1);

      expect(() => registry.register("core:health", helper2))
        .toThrow("Helper already registered: core:health");
    });

    it("should allow registering helpers with different names", () => {
      const helper1 = { ping: () => "pong" };
      const helper2 = { pong: () => "ping" };

      registry.register("core:health", helper1);
      registry.register("core:status", helper2);

      expect(registry.getHelper("core:health")).toBe(helper1);
      expect(registry.getHelper("core:status")).toBe(helper2);
    });

    it("should preserve helper and metadata references", () => {
      const helper = { ping: () => "pong" };
      const metadata = { scope: "runtime", version: 2 };

      registry.register("core:health", helper, metadata);

      const retrievedHelper = registry.getHelper("core:health");
      const retrievedMetadata = registry.getMetadata("core:health");

      expect(retrievedHelper).toBe(helper);
      expect(retrievedMetadata).toBe(metadata);
    });
  });

  describe("getHelper method", () => {
    it("should return the registered helper", () => {
      const helper = { ping: () => "pong" };

      registry.register("core:health", helper);

      expect(registry.getHelper("core:health")).toBe(helper);
    });

    it("should return undefined for unregistered helper", () => {
      expect(registry.getHelper("nonexistent")).toBeUndefined();
    });

    it("should return undefined for helpers that were never registered", () => {
      registry.register("core:health", { ping: () => "pong" });

      expect(registry.getHelper("nonexistent")).toBeUndefined();
      expect(registry.getHelper("")).toBeUndefined();
      expect(registry.getHelper(null)).toBeUndefined();
    });
  });

  describe("getMetadata method", () => {
    it("should return the metadata for a registered helper", () => {
      const metadata = { scope: "runtime", version: 2 };

      registry.register("core:health", { ping: () => "pong" }, metadata);

      expect(registry.getMetadata("core:health")).toBe(metadata);
    });

    it("should return undefined for unregistered helper", () => {
      expect(registry.getMetadata("nonexistent")).toBeUndefined();
    });

    it("should return default empty object when no metadata was provided", () => {
      registry.register("core:health", { ping: () => "pong" });

      expect(registry.getMetadata("core:health")).toEqual({});
    });
  });

  describe("listHelpers method", () => {
    it("should return an empty array when no helpers are registered", () => {
      expect(registry.listHelpers()).toEqual([]);
    });

    it("should return an array of all registered helper names", () => {
      registry.register("core:health", { ping: () => "pong" });
      registry.register("core:status", { status: () => "ok" });
      registry.register("ui:nav", { render: () => null });

      const helpers = registry.listHelpers();
      expect(helpers).toContain("core:health");
      expect(helpers).toContain("core:status");
      expect(helpers).toContain("ui:nav");
      expect(helpers).toHaveLength(3);
    });

    it("should return helpers in the order they were registered", () => {
      registry.register("first", { test: 1 });
      registry.register("second", { test: 2 });
      registry.register("third", { test: 3 });

      expect(registry.listHelpers()).toEqual(["first", "second", "third"]);
    });

    it("should return a new array instance each time", () => {
      registry.register("core:health", { ping: () => "pong" });

      const array1 = registry.listHelpers();
      const array2 = registry.listHelpers();

      expect(array1).not.toBe(array2); // Different instances
      expect(array1).toEqual(array2);  // Same content
    });
  });

  describe("isRegistered method", () => {
    it("should return true for registered helpers", () => {
      registry.register("core:health", { ping: () => "pong" });

      expect(registry.isRegistered("core:health")).toBe(true);
    });

    it("should return false for unregistered helpers", () => {
      expect(registry.isRegistered("nonexistent")).toBe(false);
    });

    it("should return false after registration fails", () => {
      registry.register("core:health", { ping: () => "pong" });

      expect(registry.isRegistered("core:health")).toBe(true);
      expect(registry.isRegistered("different")).toBe(false);
    });

    it("should handle falsy values correctly", () => {
      registry.register("0", { ping: () => "pong" }); // Register with string "0"

      expect(registry.isRegistered("0")).toBe(true);
      expect(registry.isRegistered(0)).toBe(false); // Different type
      expect(registry.isRegistered(null)).toBe(false);
      expect(registry.isRegistered(undefined)).toBe(false);
      expect(registry.isRegistered("")).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with multiple helpers", () => {
      // Register multiple helpers
      const healthHelper = { ping: () => "pong" };
      const statusHelper = { status: () => "ok" };
      const uiHelper = { render: () => null };

      registry.register("health", healthHelper, { type: "health" });
      registry.register("status", statusHelper, { type: "status" });
      registry.register("ui", uiHelper);

      // Verify all are registered
      expect(registry.isRegistered("health")).toBe(true);
      expect(registry.isRegistered("status")).toBe(true);
      expect(registry.isRegistered("ui")).toBe(true);

      // Verify helpers are returned correctly
      expect(registry.getHelper("health")).toBe(healthHelper);
      expect(registry.getHelper("status")).toBe(statusHelper);
      expect(registry.getHelper("ui")).toBe(uiHelper);

      // Verify metadata is returned correctly
      expect(registry.getMetadata("health")).toEqual({ type: "health" });
      expect(registry.getMetadata("status")).toEqual({ type: "status" });
      expect(registry.getMetadata("ui")).toEqual({});

      // Verify list of helpers
      expect(registry.listHelpers()).toEqual(["health", "status", "ui"]);
    });

    it("should handle edge cases with special characters in names", () => {
      const helper = { test: true };

      // Register with special characters
      registry.register("core:health-check", helper, { version: 1 });
      registry.register("ui.nav", helper, { version: 2 });
      registry.register("api/v1", helper, { version: 3 });

      // Verify all are registered and accessible
      expect(registry.isRegistered("core:health-check")).toBe(true);
      expect(registry.isRegistered("ui.nav")).toBe(true);
      expect(registry.isRegistered("api/v1")).toBe(true);

      expect(registry.getHelper("core:health-check")).toBe(helper);
      expect(registry.getMetadata("core:health-check")).toEqual({ version: 1 });

      expect(registry.getHelper("ui.nav")).toBe(helper);
      expect(registry.getMetadata("ui.nav")).toEqual({ version: 2 });

      expect(registry.getHelper("api/v1")).toBe(helper);
      expect(registry.getMetadata("api/v1")).toEqual({ version: 3 });

      expect(registry.listHelpers()).toEqual(["core:health-check", "ui.nav", "api/v1"]);
    });

    it("should maintain data integrity after multiple operations", () => {
      // Register, check, register more, check again
      registry.register("first", { value: 1 }, { tag: "one" });
      expect(registry.getHelper("first").value).toBe(1);
      expect(registry.getMetadata("first").tag).toBe("one");

      registry.register("second", { value: 2 }, { tag: "two" });
      expect(registry.getHelper("second").value).toBe(2);
      expect(registry.getMetadata("second").tag).toBe("two");

      // Verify first still works
      expect(registry.getHelper("first").value).toBe(1);
      expect(registry.getMetadata("first").tag).toBe("one");

      // List should contain both
      expect(registry.listHelpers()).toEqual(["first", "second"]);
    });
  });

  describe("error handling", () => {
    it("should handle registration errors gracefully", () => {
      const helper1 = { test: 1 };
      const helper2 = { test: 2 };

      // Register successfully
      registry.register("test", helper1);

      // Attempt to register duplicate - should throw
      expect(() => registry.register("test", helper2)).toThrow("Helper already registered: test");

      // Original should still be there
      expect(registry.getHelper("test")).toBe(helper1);
      expect(registry.getMetadata("test")).toEqual({});
    });

    it("should handle invalid name errors gracefully", () => {
      const helper = { test: true };

      // Try to register with invalid names - should throw
      expect(() => registry.register("", helper)).toThrow("Helper name is required");
      expect(() => registry.register(null, helper)).toThrow("Helper name is required");
      expect(() => registry.register(undefined, helper)).toThrow("Helper name is required");

      // Registry should remain empty
      expect(registry.listHelpers()).toEqual([]);
    });
  });
});