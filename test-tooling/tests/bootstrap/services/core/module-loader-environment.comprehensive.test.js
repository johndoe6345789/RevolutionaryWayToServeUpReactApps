// Comprehensive test suite for ModuleLoaderEnvironment class
const ModuleLoaderEnvironment = require("../../../../../bootstrap/services/core/module-loader-environment.js");

describe("ModuleLoaderEnvironment", () => {
  describe("constructor", () => {
    test("should throw error when no root object is provided", () => {
      expect(() => {
        new ModuleLoaderEnvironment();
      }).toThrow("Root object required for ModuleLoaderEnvironment");
      
      expect(() => {
        new ModuleLoaderEnvironment(null);
      }).toThrow("Root object required for ModuleLoaderEnvironment");
      
      expect(() => {
        new ModuleLoaderEnvironment(undefined);
      }).toThrow("Root object required for ModuleLoaderEnvironment");
    });

    test("should initialize with provided root object", () => {
      const mockRoot = { test: "value" };
      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toEqual({ helpers: {} });
      expect(env.helpers).toEqual({});
      expect(typeof env.isCommonJs).toBe("boolean");
    });

    test("should create bootstrap namespace if it doesn't exist", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);

      expect(env.namespace).toEqual({ helpers: {} });
      expect(mockRoot.__rwtraBootstrap).toBe(env.namespace);
    });

    test("should reuse existing bootstrap namespace if it exists", () => {
      const existingNamespace = { existing: "value" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.namespace).toBe(existingNamespace);
      expect(mockRoot.__rwtraBootstrap).toBe(existingNamespace);
    });

    test("should create helpers namespace if it doesn't exist", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.helpers).toEqual({});
      expect(mockRoot.__rwtraBootstrap.helpers).toBe(env.helpers);
    });

    test("should reuse existing helpers if they exist", () => {
      const existingHelpers = { existing: "helper" };
      const existingNamespace = { helpers: existingHelpers };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.helpers).toBe(existingHelpers);
      expect(mockRoot.__rwtraBootstrap.helpers).toBe(existingHelpers);
    });

    test("should set isCommonJs based on module environment", () => {
      const mockRoot = { test: "value" };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      // The value should be based on the actual module environment
      expect(typeof env.isCommonJs).toBe("boolean");
    });
  });

  describe("property access", () => {
    test("should maintain reference to the provided root", () => {
      const mockRoot = { some: "data" };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.global).toBe(mockRoot);
    });

    test("should maintain reference to the created namespace", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);
      const namespace = env.namespace;
      
      expect(env.namespace).toBe(namespace);
      
      // Modify the namespace and verify it's reflected in the root
      namespace.test = "value";
      expect(mockRoot.__rwtraBootstrap.test).toBe("value");
    });

    test("should maintain reference to the created helpers", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);
      const helpers = env.helpers;
      
      expect(env.helpers).toBe(helpers);
      
      // Modify the helpers and verify it's reflected in the namespace
      helpers.test = "value";
      expect(mockRoot.__rwtraBootstrap.helpers.test).toBe("value");
    });
  });

  describe("namespace and helpers relationships", () => {
    test("should ensure helpers are nested within namespace", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(env.helpers).toBe(mockRoot.__rwtraBootstrap.helpers);
      expect(env.helpers).toBe(env.namespace.helpers);
    });

    test("should preserve existing namespace structure", () => {
      const existingData = { 
        existing: "value", 
        helpers: { existingHelper: "test" } 
      };
      const mockRoot = { __rwtraBootstrap: existingData };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.namespace).toBe(existingData);
      expect(env.helpers).toBe(existingData.helpers);
      expect(env.helpers.existingHelper).toBe("test");
      expect(env.namespace.existing).toBe("value");
    });
  });

  describe("edge cases", () => {
    test("should handle root object with null prototype", () => {
      const mockRoot = Object.create(null);
      mockRoot.test = "value";
      
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toEqual({});
      expect(env.helpers).toEqual({});
      expect(typeof env.isCommonJs).toBe("boolean");
      
      // Verify the namespace was added to the root
      expect(mockRoot.__rwtraBootstrap).toBeDefined();
    });

    test("should handle root object with existing non-object bootstrap", () => {
      const mockRoot = { __rwtraBootstrap: "not-an-object" };
      
      // This test checks what happens when __rwtraBootstrap is not an object
      // The current implementation would overwrite it, which is expected behavior
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.namespace).toEqual({});
      expect(typeof mockRoot.__rwtraBootstrap).toBe("object");
      expect(mockRoot.__rwtraBootstrap).toBe(env.namespace);
    });

    test("should handle root object with existing namespace without helpers", () => {
      const existingNamespace = { some: "data" };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      expect(env.namespace).toBe(existingNamespace);
      expect(env.helpers).toEqual({});
      expect(existingNamespace.helpers).toBe(env.helpers);
      expect(existingNamespace.some).toBe("data");
    });
  });

  describe("isCommonJs property", () => {
    test("should reflect the CommonJS environment status", () => {
      const mockRoot = { test: "value" };
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      // The value is determined by the runtime environment
      expect(typeof env.isCommonJs).toBe("boolean");
    });
  });

  describe("integration tests", () => {
    test("should properly initialize all properties and maintain relationships", () => {
      const mockRoot = {};
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      // Verify all properties are properly set
      expect(env.global).toBe(mockRoot);
      expect(env.namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(env.helpers).toBe(mockRoot.__rwtraBootstrap.helpers);
      expect(env.helpers).toBe(env.namespace.helpers);
      expect(typeof env.isCommonJs).toBe("boolean");
      
      // Verify that changes to the namespace and helpers are reflected
      env.namespace.test = "namespace-value";
      env.helpers.test = "helpers-value";
      
      expect(mockRoot.__rwtraBootstrap.test).toBe("namespace-value");
      expect(mockRoot.__rwtraBootstrap.helpers.test).toBe("helpers-value");
    });

    test("should work correctly with an existing bootstrap setup", () => {
      const existingHelpers = { existing: "helper" };
      const existingNamespace = { 
        existing: "namespace", 
        helpers: existingHelpers 
      };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      
      const env = new ModuleLoaderEnvironment(mockRoot);
      
      // Verify that existing data is preserved
      expect(env.namespace).toBe(existingNamespace);
      expect(env.helpers).toBe(existingHelpers);
      expect(env.namespace.existing).toBe("namespace");
      expect(env.helpers.existing).toBe("helper");
      
      // Verify that new data can be added
      env.namespace.newData = "new-namespace-value";
      env.helpers.newData = "new-helpers-value";
      
      expect(existingNamespace.newData).toBe("new-namespace-value");
      expect(existingHelpers.newData).toBe("new-helpers-value");
    });
  });
});