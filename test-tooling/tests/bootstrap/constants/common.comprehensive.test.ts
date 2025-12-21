const commonConstants = require("../../../../bootstrap/constants/common.js");

describe("Common Constants Module", () => {
  describe("defaultFallbackProviders constant", () => {
    it("should provide an empty array as the default fallback providers list", () => {
      const defaultFallbackProviders = require("../../../../bootstrap/constants/default-fallback-providers.js");
      
      expect(defaultFallbackProviders).toEqual([]);
      expect(Array.isArray(defaultFallbackProviders)).toBe(true);
    });

    it("should return a fresh array instance each time to prevent mutation leaks", () => {
      const array1 = require("../../../../bootstrap/constants/default-fallback-providers.js");
      const array2 = require("../../../../bootstrap/constants/default-fallback-providers.js");
      
      expect(array1).toEqual([]);
      expect(array2).toEqual([]);
      expect(array1).not.toBe(array2); // Different instances to prevent mutation
    });

    it("should allow pushing elements without affecting other imports", () => {
      const array1 = require("../../../../bootstrap/constants/default-fallback-providers.js");
      const array2 = require("../../../../bootstrap/constants/default-fallback-providers.js");
      
      array1.push("test-provider");
      
      expect(array1).toEqual(["test-provider"]);
      expect(array2).toEqual([]); // Should remain unchanged
    });
  });

  describe("localModuleExtensions constant", () => {
    it("should provide the correct list of supported local module extensions", () => {
      const localModuleExtensions = require("../../../../bootstrap/constants/local-module-extensions.js");
      const expectedExtensions = ["", ".tsx", ".ts", ".jsx", ".js"];
      
      expect(localModuleExtensions).toEqual(expectedExtensions);
    });

    it("should contain string values that start with a dot (except the empty string)", () => {
      const localModuleExtensions = require("../../../../bootstrap/constants/local-module-extensions.js");
      
      for (const ext of localModuleExtensions) {
        if (ext !== "") {
          expect(ext.startsWith(".")).toBe(true);
        }
      }
    });

    it("should return a fresh array instance each time to prevent mutation leaks", () => {
      const array1 = require("../../../../bootstrap/constants/local-module-extensions.js");
      const array2 = require("../../../../bootstrap/constants/local-module-extensions.js");
      
      expect(array1).toEqual(array2);
      expect(array1).not.toBe(array2); // Different instances
    });

    it("should maintain the correct order of extensions", () => {
      const localModuleExtensions = require("../../../../bootstrap/constants/local-module-extensions.js");
      expect(localModuleExtensions[0]).toBe(""); // Empty string should be first
      expect(localModuleExtensions[1]).toBe(".tsx");
      expect(localModuleExtensions[2]).toBe(".ts");
      expect(localModuleExtensions[3]).toBe(".jsx");
      expect(localModuleExtensions[4]).toBe(".js");
    });
  });

  describe("proxy mode constants", () => {
    it("should provide the auto proxy mode constant with value 'auto'", () => {
      const proxyModeAuto = require("../../../../bootstrap/constants/proxy-mode-auto.js");
      expect(proxyModeAuto).toBe("auto");
    });

    it("should provide the proxy-only proxy mode constant with value 'proxy'", () => {
      const proxyModeProxy = require("../../../../bootstrap/constants/proxy-mode-proxy.js");
      expect(proxyModeProxy).toBe("proxy");
    });

    it("should provide the direct proxy mode constant with value 'direct'", () => {
      const proxyModeDirect = require("../../../../bootstrap/constants/proxy-mode-direct.js");
      expect(proxyModeDirect).toBe("direct");
    });
  });

  describe("logging related constants", () => {
    it("should provide the CI log query parameter constant", () => {
      const ciLogQueryParam = require("../../../../bootstrap/constants/ci-log-query-param.js");
      expect(typeof ciLogQueryParam).toBe("string");
    });

    it("should provide the client log endpoint constant", () => {
      const clientLogEndpoint = require("../../../../bootstrap/constants/client-log-endpoint.js");
      expect(typeof clientLogEndpoint).toBe("string");
    });
  });

  describe("URL related constants", () => {
    it("should provide the script manifest URL constant", () => {
      const scriptManifestUrl = require("../../../../bootstrap/constants/script-manifest-url.js");
      expect(typeof scriptManifestUrl).toBe("string");
      // Could be relative or absolute URL
      expect(typeof scriptManifestUrl).toBe("string");
    });
  });

  describe("provider aliases constant", () => {
    it("should provide the default provider aliases function", () => {
      const getDefaultProviderAliases = require("../../../../bootstrap/constants/default-provider-aliases.js");
      expect(typeof getDefaultProviderAliases).toBe("function");
      expect(getDefaultProviderAliases()).toEqual({});
    });

    it("should return a fresh object instance each time", () => {
      const obj1 = require("../../../../bootstrap/constants/default-provider-aliases.js")();
      const obj2 = require("../../../../bootstrap/constants/default-provider-aliases.js")();
      
      expect(obj1).toEqual({});
      expect(obj2).toEqual({});
      expect(obj1).not.toBe(obj2); // Different instances to prevent mutation
    });
  });

  describe("comprehensive integration", () => {
    it("should export all expected constants with correct types", () => {
      expect(commonConstants).toHaveProperty('ciLogQueryParam');
      expect(commonConstants).toHaveProperty('clientLogEndpoint');
      expect(commonConstants).toHaveProperty('defaultFallbackProviders');
      expect(commonConstants).toHaveProperty('getDefaultProviderAliases');
      expect(commonConstants).toHaveProperty('proxyModeAuto');
      expect(commonConstants).toHaveProperty('proxyModeProxy');
      expect(commonConstants).toHaveProperty('proxyModeDirect');
      expect(commonConstants).toHaveProperty('scriptManifestUrl');
      expect(commonConstants).toHaveProperty('localModuleExtensions');
      
      // Verify types
      expect(typeof commonConstants.ciLogQueryParam).toBe('string');
      expect(typeof commonConstants.clientLogEndpoint).toBe('string');
      expect(Array.isArray(commonConstants.defaultFallbackProviders)).toBe(true);
      expect(typeof commonConstants.getDefaultProviderAliases).toBe('function');
      expect(typeof commonConstants.proxyModeAuto).toBe('string');
      expect(typeof commonConstants.proxyModeProxy).toBe('string');
      expect(typeof commonConstants.proxyModeDirect).toBe('string');
      expect(typeof commonConstants.scriptManifestUrl).toBe('string');
      expect(Array.isArray(commonConstants.localModuleExtensions)).toBe(true);
    });
  });

  describe("mutation protection", () => {
    it("should handle potential mutations safely", () => {
      const extensions1 = require("../../../../bootstrap/constants/local-module-extensions.js");
      const extensions2 = require("../../../../bootstrap/constants/local-module-extensions.js");
      
      // Try to mutate the first instance
      extensions1.push(".test");
      extensions1.splice(0, 1);
      
      // Second instance should remain unchanged
      expect(extensions2).toEqual(["", ".tsx", ".ts", ".jsx", ".js"]);
    });

    it("should return consistent values regardless of mutations to previous imports", () => {
      // First, import and mutate
      const mutableArray = require("../../../../bootstrap/constants/default-fallback-providers.js");
      mutableArray.push("mutated");
      
      // Import again and verify it's still the original value
      const freshArray = require("../../../../bootstrap/constants/default-fallback-providers.js");
      expect(freshArray).toEqual([]);
    });
  });
});