const HelperRegistry = require("../../../../bootstrap/helpers/helper-registry.js");

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
  });

  describe("register method", () => {
    it("should register a helper with name and metadata", () => {
      const mockHelper = { name: "testHelper" };
      const metadata = { version: "1.0.0", author: "test" };

      registry.register("testHelper", mockHelper, metadata);

      expect(registry.isRegistered("testHelper")).toBe(true);
      expect(registry.getHelper("testHelper")).toBe(mockHelper);
      expect(registry.getMetadata("testHelper")).toEqual(metadata);
    });

    it("should register a helper with name and no metadata", () => {
      const mockHelper = { name: "testHelper" };

      registry.register("testHelper", mockHelper);

      expect(registry.isRegistered("testHelper")).toBe(true);
      expect(registry.getHelper("testHelper")).toBe(mockHelper);
      expect(registry.getMetadata("testHelper")).toEqual({});
    });

    it("should throw an error when name is not provided", () => {
      const mockHelper = { name: "testHelper" };

      expect(() => {
        registry.register("", mockHelper);
      }).toThrow("Helper name is required");

      expect(() => {
        registry.register(null, mockHelper);
      }).toThrow("Helper name is required");

      expect(() => {
        registry.register(undefined, mockHelper);
      }).toThrow("Helper name is required");
    });

    it("should throw an error when helper is already registered", () => {
      const mockHelper1 = { name: "testHelper" };
      const mockHelper2 = { name: "testHelper" };

      registry.register("testHelper", mockHelper1);

      expect(() => {
        registry.register("testHelper", mockHelper2);
      }).toThrow("Helper already registered: testHelper");
    });

    it("should handle different name types", () => {
      // Test with string name
      const helper1 = { type: "string" };
      registry.register("stringHelper", helper1);
      expect(registry.getHelper("stringHelper")).toBe(helper1);

      // Test with number - in JavaScript Maps, keys keep their type
      const helper2 = { type: "number" };
      registry.register(123, helper2);
      expect(registry.getHelper(123)).toBe(helper2);  // Use same type for retrieval

      // Test with boolean - in JavaScript Maps, keys keep their type
      const helper3 = { type: "boolean" };
      registry.register(true, helper3);
      expect(registry.getHelper(true)).toBe(helper3);  // Use same type for retrieval
    });
  });

  describe("getHelper method", () => {
    it("should return the registered helper", () => {
      const mockHelper = { name: "testHelper" };

      registry.register("testHelper", mockHelper);

      expect(registry.getHelper("testHelper")).toBe(mockHelper);
    });

    it("should return undefined for unregistered helper", () => {
      expect(registry.getHelper("nonExistentHelper")).toBeUndefined();
    });
  });

  describe("listHelpers method", () => {
    it("should return empty array when no helpers registered", () => {
      expect(registry.listHelpers()).toEqual([]);
    });

    it("should list all registered helper names", () => {
      const helper1 = { name: "helper1" };
      const helper2 = { name: "helper2" };

      registry.register("helper1", helper1);
      registry.register("helper2", helper2);

      const helperList = registry.listHelpers();
      expect(helperList).toContain("helper1");
      expect(helperList).toContain("helper2");
      expect(helperList).toHaveLength(2);
    });

    it("should maintain registration order", () => {
      registry.register("first", {});
      registry.register("second", {});
      registry.register("third", {});

      const helperList = registry.listHelpers();
      expect(helperList[0]).toBe("first");
      expect(helperList[1]).toBe("second");
      expect(helperList[2]).toBe("third");
    });
  });

  describe("getMetadata method", () => {
    it("should return metadata for registered helper", () => {
      const metadata = { version: "1.0.0", author: "test" };
      registry.register("testHelper", { name: "testHelper" }, metadata);

      expect(registry.getMetadata("testHelper")).toEqual(metadata);
    });

    it("should return empty object when no metadata was provided", () => {
      registry.register("testHelper", { name: "testHelper" });

      expect(registry.getMetadata("testHelper")).toEqual({});
    });

    it("should return undefined for unregistered helper", () => {
      expect(registry.getMetadata("nonExistentHelper")).toBeUndefined();
    });
  });

  describe("isRegistered method", () => {
    it("should return true for registered helper", () => {
      registry.register("testHelper", { name: "testHelper" });

      expect(registry.isRegistered("testHelper")).toBe(true);
    });

    it("should return false for unregistered helper", () => {
      expect(registry.isRegistered("nonExistentHelper")).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle of registering, retrieving, and checking helpers", () => {
      // Register multiple helpers with different metadata
      const helper1 = { process: () => "processed1" };
      const helper2 = { process: () => "processed2" };
      const metadata1 = { type: "processor", version: "1.0" };
      const metadata2 = { type: "formatter", version: "2.0" };

      registry.register("processor", helper1, metadata1);
      registry.register("formatter", helper2, metadata2);

      // Verify they are registered
      expect(registry.isRegistered("processor")).toBe(true);
      expect(registry.isRegistered("formatter")).toBe(true);

      // Verify helpers can be retrieved
      expect(registry.getHelper("processor")).toBe(helper1);
      expect(registry.getHelper("formatter")).toBe(helper2);

      // Verify metadata is stored correctly
      expect(registry.getMetadata("processor")).toEqual(metadata1);
      expect(registry.getMetadata("formatter")).toEqual(metadata2);

      // Verify helper listing works
      const helperList = registry.listHelpers();
      expect(helperList).toContain("processor");
      expect(helperList).toContain("formatter");
      expect(helperList).toHaveLength(2);

      // Verify individual helper retrieval
      expect(registry.getHelper("processor").process()).toBe("processed1");
      expect(registry.getHelper("formatter").process()).toBe("processed2");
    });

    it("should handle edge cases with various helper types", () => {
      // Register different types of helpers
      registry.register("functionHelper", () => "result");
      registry.register("objectHelper", { method: () => "result" });
      registry.register("classHelper", class {});
      registry.register("primitiveHelper", "stringHelper");
      registry.register("nullHelper", null);

      // Verify all are registered
      expect(registry.isRegistered("functionHelper")).toBe(true);
      expect(registry.isRegistered("objectHelper")).toBe(true);
      expect(registry.isRegistered("classHelper")).toBe(true);
      expect(registry.isRegistered("primitiveHelper")).toBe(true);
      expect(registry.isRegistered("nullHelper")).toBe(true);

      // Verify retrieval
      expect(typeof registry.getHelper("functionHelper")).toBe("function");
      expect(typeof registry.getHelper("objectHelper")).toBe("object");
      expect(typeof registry.getHelper("classHelper")).toBe("function"); // class is function in JS
      expect(registry.getHelper("primitiveHelper")).toBe("stringHelper"); // The actual value, not its type name
      expect(registry.getHelper("nullHelper")).toBeNull();
    });

    it("should handle complex metadata scenarios", () => {
      const complexMetadata = {
        version: "1.0.0",
        dependencies: ["helper1", "helper2"],
        config: {
          enabled: true,
          options: { timeout: 5000 }
        },
        author: {
          name: "test",
          email: "test@example.com"
        }
      };

      registry.register("complexHelper", { name: "complex" }, complexMetadata);

      expect(registry.getHelper("complexHelper").name).toBe("complex");
      expect(registry.getMetadata("complexHelper")).toEqual(complexMetadata);
    });
  });
});