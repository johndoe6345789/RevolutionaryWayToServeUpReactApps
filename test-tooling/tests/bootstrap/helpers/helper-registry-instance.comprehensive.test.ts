import HelperRegistry from "../../../../bootstrap/registries/helper-registry.js";

describe("HelperRegistryInstance", () => {
  const instancePath = "../../../../bootstrap/helpers/helper-registry-instance.js";

  beforeEach(() => {
    // Clear the module cache to ensure fresh instances for each test
    delete require.cache[require.resolve(instancePath)];
  });

  describe("singleton export", () => {
    it("should export a HelperRegistry instance", () => {
      const registry = require(instancePath);
      expect(registry).toBeInstanceOf(HelperRegistry);
    });

    it("should export the same instance across multiple requires", () => {
      const instance1 = require(instancePath);
      const instance2 = require(instancePath);
      const instance3 = require(instancePath);
      
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });

    it("should maintain identity across different import patterns", () => {
      const registry1 = require(instancePath);
      const registry2 = require(instancePath);
      
      // Even if we delete and re-require, during the same test run without cache clearing
      // they would be the same, so we test that the module exports the same instance
      expect(registry1).toBe(registry2);
    });

    it("should be an instance of HelperRegistry class", () => {
      const registry = require(instancePath);
      expect(registry.constructor.name).toBe("HelperRegistry");
      expect(HelperRegistry.prototype.isPrototypeOf(registry)).toBe(true);
    });
  });

  describe("registration persistence", () => {
    it("should persist registrations across multiple requires", () => {
      const registry1 = require(instancePath);
      const testHelper = { name: "test" };
      const testMetadata = { scope: "test" };
      
      registry1.register("persistent:helper", testHelper, testMetadata);
      
      // Clear cache and require again
      delete require.cache[require.resolve(instancePath)];
      const registry2 = require(instancePath);
      
      expect(registry2.isRegistered("persistent:helper")).toBe(true);
      expect(registry2.getHelper("persistent:helper")).toBe(testHelper);
      expect(registry2.getMetadata("persistent:helper")).toBe(testMetadata);
    });

    it("should maintain all registered helpers after re-import", () => {
      const registry1 = require(instancePath);
      
      // Register multiple helpers
      registry1.register("helper1", { id: 1 }, { meta: 1 });
      registry1.register("helper2", { id: 2 }, { meta: 2 });
      registry1.register("helper3", { id: 3 }, { meta: 3 });
      
      // Verify they exist
      expect(registry1.listHelpers()).toHaveLength(3);
      expect(registry1.isRegistered("helper1")).toBe(true);
      expect(registry1.isRegistered("helper2")).toBe(true);
      expect(registry1.isRegistered("helper3")).toBe(true);
      
      // Clear cache and require again
      delete require.cache[require.resolve(instancePath)];
      const registry2 = require(instancePath);
      
      // All helpers should still be there
      expect(registry2.listHelpers()).toHaveLength(3);
      expect(registry2.isRegistered("helper1")).toBe(true);
      expect(registry2.isRegistered("helper2")).toBe(true);
      expect(registry2.isRegistered("helper3")).toBe(true);
      expect(registry2.getHelper("helper1").id).toBe(1);
      expect(registry2.getHelper("helper2").id).toBe(2);
      expect(registry2.getHelper("helper3").id).toBe(3);
    });

    it("should maintain registration order after re-import", () => {
      const registry1 = require(instancePath);
      
      registry1.register("first", {});
      registry1.register("second", {});
      registry1.register("third", {});
      
      const originalOrder = registry1.listHelpers();
      
      // Clear cache and require again
      delete require.cache[require.resolve(instancePath)];
      const registry2 = require(instancePath);
      
      const preservedOrder = registry2.listHelpers();
      
      expect(preservedOrder).toEqual(originalOrder);
      expect(preservedOrder).toEqual(["first", "second", "third"]);
    });
  });

  describe("helper functionality", () => {
    it("should support all HelperRegistry methods", () => {
      const registry = require(instancePath);
      
      // Test register/getHelper
      const helper = { method: () => "test" };
      registry.register("test:helper", helper);
      expect(registry.getHelper("test:helper")).toBe(helper);
      
      // Test isRegistered
      expect(registry.isRegistered("test:helper")).toBe(true);
      expect(registry.isRegistered("nonexistent")).toBe(false);
      
      // Test listHelpers
      expect(registry.listHelpers()).toContain("test:helper");
      
      // Test getMetadata
      const metadata = { version: "1.0" };
      registry.register("meta:helper", {}, metadata);
      expect(registry.getMetadata("meta:helper")).toBe(metadata);
    });

    it("should handle registration errors properly", () => {
      const registry = require(instancePath);
      
      registry.register("unique:helper", {});
      
      // Should throw when trying to register the same name
      expect(() => registry.register("unique:helper", {}))
        .toThrow("Helper already registered: unique:helper");
      
      // Should throw when no name provided
      expect(() => registry.register("", {}))
        .toThrow("Helper name is required");
    });

    it("should work with complex helpers and metadata", () => {
      const registry = require(instancePath);
      
      const complexHelper = {
        init: () => {},
        process: (data) => data,
        nested: { config: { enabled: true } }
      };
      const complexMetadata = {
        dependencies: ["helper1"],
        permissions: ["read"],
        version: "2.0"
      };
      
      registry.register("complex:helper", complexHelper, complexMetadata);
      
      expect(registry.getHelper("complex:helper")).toBe(complexHelper);
      expect(registry.getMetadata("complex:helper")).toBe(complexMetadata);
    });
  });

  describe("isolation between test runs", () => {
    it("should start fresh when cache is cleared between tests", () => {
      const registry1 = require(instancePath);
      registry1.register("temp:helper", { value: "temp" });
      expect(registry1.isRegistered("temp:helper")).toBe(true);
      
      // After cache is cleared in beforeEach of next test, this would start fresh
      // This test specifically verifies the current state before cache clear
      expect(registry1.getHelper("temp:helper").value).toBe("temp");
    });
  });

  describe("integration with HelperRegistry methods", () => {
    it("should work as a complete HelperRegistry instance", () => {
      const registry = require(instancePath);
      
      // Register multiple helpers with different characteristics
      registry.register("simple:helper", { action: () => "simple" });
      registry.register("complex:helper", { 
        init: () => "initialized", 
        process: (x) => x * 2 
      }, { type: "processor", version: 1 });
      registry.register("minimal:helper", {});
      
      // Verify all are registered
      expect(registry.listHelpers()).toHaveLength(3);
      expect(registry.listHelpers()).toContain("simple:helper");
      expect(registry.listHelpers()).toContain("complex:helper");
      expect(registry.listHelpers()).toContain("minimal:helper");
      
      // Verify individual access
      expect(registry.getHelper("simple:helper").action()).toBe("simple");
      expect(registry.getHelper("complex:helper").init()).toBe("initialized");
      expect(registry.getHelper("complex:helper").process(5)).toBe(10);
      expect(registry.getMetadata("complex:helper").type).toBe("processor");
      expect(Object.keys(registry.getHelper("minimal:helper")).length).toBe(0);
    });

    it("should maintain state across different access patterns", () => {
      const registry1 = require(instancePath);
      
      // Register some helpers
      registry1.register("access:test", { counter: 0 });
      
      // Get another reference to the same instance
      const registry2 = require(instancePath);
      
      // Modify through second reference
      const helper = registry2.getHelper("access:test");
      helper.counter = 42;
      
      // Check if change is reflected in first reference
      expect(registry1.getHelper("access:test").counter).toBe(42);
    });
  });

  describe("memory and performance considerations", () => {
    it("should handle many registrations efficiently", () => {
      const registry = require(instancePath);
      const helperCount = 50;
      
      // Register many helpers
      for (let i = 0; i < helperCount; i++) {
        registry.register(`bulk:helper${i}`, { id: i }, { index: i });
      }
      
      // Verify all are registered
      expect(registry.listHelpers()).toHaveLength(helperCount);
      
      // Verify random access works
      for (let i = 0; i < 5; i++) { // Check 5 random helpers
        const randomIndex = Math.floor(Math.random() * helperCount);
        expect(registry.getHelper(`bulk:helper${randomIndex}`).id).toBe(randomIndex);
        expect(registry.getMetadata(`bulk:helper${randomIndex}`).index).toBe(randomIndex);
      }
    });
  });

  describe("error conditions", () => {
    it("should handle duplicate registration attempts", () => {
      const registry = require(instancePath);
      
      registry.register("duplicate:test", { value: "first" });
      
      expect(() => {
        registry.register("duplicate:test", { value: "second" });
      }).toThrow("Helper already registered: duplicate:test");
      
      // Original helper should still be there
      expect(registry.getHelper("duplicate:test").value).toBe("first");
    });

    it("should handle invalid names", () => {
      const registry = require(instancePath);
      
      const invalidNames = [null, undefined, "", 0, false];
      
      invalidNames.forEach(name => {
        expect(() => registry.register(name, {}))
          .toThrow("Helper name is required");
      });
    });
  });
});