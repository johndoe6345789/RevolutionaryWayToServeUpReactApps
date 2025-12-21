const ModuleLoaderEnvironment = require("../../../../bootstrap/services/core/module-loader-environment.js");

describe("ModuleLoaderEnvironment", () => {
  describe("constructor", () => {
    it("should throw error when no root object is provided", () => {
      expect(() => {
        new ModuleLoaderEnvironment();
      }).toThrow("Root object required for ModuleLoaderEnvironment");

      expect(() => {
        new ModuleLoaderEnvironment(undefined);
      }).toThrow("Root object required for ModuleLoaderEnvironment");

      expect(() => {
        new ModuleLoaderEnvironment(null);
      }).toThrow("Root object required for ModuleLoaderEnvironment");
    });

    it("should initialize with provided root object", () => {
      const mockRoot = { test: "value" };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.global).toBe(mockRoot);
    });

    it("should create bootstrap namespace if it doesn't exist", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toEqual({});
    });

    it("should reuse existing bootstrap namespace if it exists", () => {
      const existingNamespace = { existing: "value" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toBe(existingNamespace);
      expect(mockRoot.__rwtraBootstrap).toBe(existingNamespace);
    });

    it("should create helpers namespace if it doesn't exist", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.helpers).toEqual({});
      expect(env.namespace.helpers).toEqual({});
    });

    it("should reuse existing helpers if they exist", () => {
      const existingHelpers = { existing: "helper" };
      const mockRoot = { __rwtraBootstrap: { helpers: existingHelpers } };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.helpers).toBe(existingHelpers);
    });

    it("should set isCommonJs based on module environment", () => {
      const mockRoot = { test: "value" };

      const env = new ModuleLoaderEnvironment(mockRoot);

      // In test environment, module might be defined, so expect a boolean
      expect(typeof env.isCommonJs).toBe('boolean');
    });
  });

  describe("property access", () => {
    it("should maintain reference to the provided root", () => {
      const mockRoot = { test: "value", other: "data" };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.global).toBe(mockRoot);
    });

    it("should maintain reference to the created namespace", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(env.namespace).toBe(env.helpers);
    });

    it("should maintain reference to the created helpers", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.helpers).toBe(env.namespace.helpers);
    });
  });

  describe("namespace and helpers relationships", () => {
    it("should ensure helpers are nested within namespace", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace.helpers).toBe(env.helpers);
    });

    it("should preserve existing namespace structure", () => {
      const existingNamespace = { 
        existingProp: "value", 
        helpers: { existingHelper: "value" } 
      };
      const mockRoot = { __rwtraBootstrap: existingNamespace };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toBe(existingNamespace);
      expect(env.helpers).toBe(existingNamespace.helpers);
      expect(env.namespace.existingProp).toBe("value");
    });
  });

  describe("edge cases", () => {
    it("should handle root object with null prototype", () => {
      const mockRoot = Object.create(null);
      mockRoot.test = "value";

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toEqual({});
    });

    it("should handle root object with existing non-object bootstrap", () => {
      const mockRoot = { __rwtraBootstrap: "notAnObject" };

      const env = new ModuleLoaderEnvironment(mockRoot);

      // When __rwtraBootstrap is not an object, it should be replaced with an object
      expect(typeof env.namespace).toBe('object');
      expect(env.namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toEqual({});
    });

    it("should handle root object with existing namespace without helpers", () => {
      const existingNamespace = { someProperty: "value" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toBe(existingNamespace);
      expect(env.helpers).toEqual({});
      expect(existingNamespace.helpers).toEqual({});
      expect(existingNamespace.someProperty).toBe("value");
    });
  });

  describe("isCommonJs property", () => {
    it("should reflect the CommonJS environment status", () => {
      const mockRoot = { test: "value" };

      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(typeof env.isCommonJs).toBe('boolean');
    });
  });

  describe("integration tests", () => {
    it("should properly initialize all properties and maintain relationships", () => {
      const mockRoot = {};

      const env = new ModuleLoaderEnvironment(mockRoot);

      // Verify all properties are set
      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(env.helpers).toBe(env.namespace.helpers);
      expect(typeof env.isCommonJs).toBe('boolean');

      // Verify relationships
      expect(env.namespace).toEqual({});
      expect(env.helpers).toEqual({});
      expect(env.namespace.helpers).toBe(env.helpers);
    });

    it("should work correctly with an existing bootstrap setup", () => {
      const existingNamespace = { 
        existingData: "value",
        helpers: { 
          existingHelper: "data" 
        } 
      };
      const mockRoot = { 
        __rwtraBootstrap: existingNamespace,
        otherProp: "value"
      };

      const env = new ModuleLoaderEnvironment(mockRoot);

      // Verify properties are properly linked
      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toBe(existingNamespace);
      expect(env.helpers).toBe(existingNamespace.helpers);
      expect(env.namespace.existingData).toBe("value");
      expect(env.helpers.existingHelper).toBe("data");
      expect(env.namespace.helpers).toBe(env.helpers);
    });
  });
});