const commonConstants = require("../../../../bootstrap/constants/common.js");

describe("Common Constants Module", () => {
  describe("defaultFallbackProviders constant", () => {
    it("should provide an empty array as the default fallback providers list", () => {
      expect(commonConstants.defaultFallbackProviders).toEqual([]);
      expect(Array.isArray(commonConstants.defaultFallbackProviders)).toBe(true);
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
      const expectedExtensions = ["", ".tsx", ".ts", ".jsx", ".js"];
      expect(commonConstants.localModuleExtensions).toEqual(expectedExtensions);
    });

    it("should contain string values that start with a dot or are empty string", () => {
      const extensions = commonConstants.localModuleExtensions;
      for (const ext of extensions) {
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
      const extensions = commonConstants.localModuleExtensions;
      expect(extensions[0]).toBe(""); // Empty string should be first
      expect(extensions[1]).toBe(".tsx");
      expect(extensions[2]).toBe(".ts");
      expect(extensions[3]).toBe(".jsx");
      expect(extensions[4]).toBe(".js");
    });
  });

  describe("proxy mode constants", () => {
    it("should provide the auto proxy mode constant", () => {
      const proxyModeAuto = require("../../../../bootstrap/constants/proxy-mode-auto.js");
      expect(typeof proxyModeAuto).toBe("string");
      expect(proxyModeAuto).toBe("auto");
    });

    it("should provide the proxy-only proxy mode constant", () => {
      const proxyModeProxy = require("../../../../bootstrap/constants/proxy-mode-proxy.js");
      expect(typeof proxyModeProxy).toBe("string");
      expect(proxyModeProxy).toBe("proxy");
    });

    it("should provide the direct proxy mode constant", () => {
      const proxyModeDirect = require("../../../../bootstrap/constants/proxy-mode-direct.js");
      expect(typeof proxyModeDirect).toBe("string");
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
      expect(scriptManifestUrl).toMatch(/^https?:\/\//); // Should be a valid URL
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

  describe("edge cases and mutation protection", () => {
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