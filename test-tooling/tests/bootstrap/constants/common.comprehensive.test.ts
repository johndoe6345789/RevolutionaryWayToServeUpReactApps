import common from "../../../../bootstrap/constants/common.js";
import ciLogQueryParam from "../../../../bootstrap/constants/ci-log-query-param.js";
import clientLogEndpoint from "../../../../bootstrap/constants/client-log-endpoint.js";
import defaultFallbackProviders from "../../../../bootstrap/constants/default-fallback-providers.js";
import getDefaultProviderAliases from "../../../../bootstrap/constants/default-provider-aliases.js";
import proxyModeAuto from "../../../../bootstrap/constants/proxy-mode-auto.js";
import proxyModeProxy from "../../../../bootstrap/constants/proxy-mode-proxy.js";
import proxyModeDirect from "../../../../bootstrap/constants/proxy-mode-direct.js";
import scriptManifestUrl from "../../../../bootstrap/constants/script-manifest-url.js";
import localModuleExtensions from "../../../../bootstrap/constants/local-module-extensions.js";

describe("Common Constants Module", () => {
  describe("exports structure", () => {
    it("should export an object with all expected properties", () => {
      expect(common).toBeInstanceOf(Object);
      expect(common).toHaveProperty('ciLogQueryParam');
      expect(common).toHaveProperty('clientLogEndpoint');
      expect(common).toHaveProperty('defaultFallbackProviders');
      expect(common).toHaveProperty('getDefaultProviderAliases');
      expect(common).toHaveProperty('proxyModeAuto');
      expect(common).toHaveProperty('proxyModeProxy');
      expect(common).toHaveProperty('proxyModeDirect');
      expect(common).toHaveProperty('scriptManifestUrl');
      expect(common).toHaveProperty('localModuleExtensions');
    });

    it("should have exactly 9 exported properties", () => {
      const exportedKeys = Object.keys(common);
      expect(exportedKeys).toHaveLength(9);
      expect(exportedKeys.sort()).toEqual([
        'ciLogQueryParam',
        'clientLogEndpoint',
        'defaultFallbackProviders',
        'getDefaultProviderAliases',
        'proxyModeAuto',
        'proxyModeDirect',
        'proxyModeProxy',
        'scriptManifestUrl',
        'localModuleExtensions'
      ].sort());
    });
  });

  describe("ciLogQueryParam constant", () => {
    it("should export the ciLogQueryParam constant", () => {
      expect(common.ciLogQueryParam).toBeDefined();
      expect(common.ciLogQueryParam).toBe(ciLogQueryParam);
      expect(typeof common.ciLogQueryParam).toBe('string');
    });

    it("should be a non-empty string", () => {
      expect(common.ciLogQueryParam).not.toBe('');
      expect(common.ciLogQueryParam.length).toBeGreaterThan(0);
    });
  });

  describe("clientLogEndpoint constant", () => {
    it("should export the clientLogEndpoint constant", () => {
      expect(common.clientLogEndpoint).toBeDefined();
      expect(common.clientLogEndpoint).toBe(clientLogEndpoint);
      expect(typeof common.clientLogEndpoint).toBe('string');
    });

    it("should be a non-empty string", () => {
      expect(common.clientLogEndpoint).not.toBe('');
      expect(common.clientLogEndpoint.length).toBeGreaterThan(0);
    });
  });

  describe("defaultFallbackProviders constant", () => {
    it("should export the defaultFallbackProviders constant", () => {
      expect(common.defaultFallbackProviders).toBeDefined();
      expect(common.defaultFallbackProviders).toEqual(defaultFallbackProviders);
    });

    it("should be an array", () => {
      expect(Array.isArray(common.defaultFallbackProviders)).toBe(true);
    });

    it("should have at least one provider", () => {
      expect(common.defaultFallbackProviders.length).toBeGreaterThan(0);
    });

    it("should contain string values", () => {
      common.defaultFallbackProviders.forEach(provider => {
        expect(typeof provider).toBe('string');
        expect(provider).not.toBe('');
      });
    });

    it("should return a fresh array each time to avoid mutation leaks", () => {
      const arr1 = common.defaultFallbackProviders;
      const arr2 = common.defaultFallbackProviders;
      expect(arr1).not.toBe(arr2); // Different array instances
      expect(arr1).toEqual(arr2); // Same content
    });
  });

  describe("getDefaultProviderAliases function", () => {
    it("should export the getDefaultProviderAliases function", () => {
      expect(common.getDefaultProviderAliases).toBeDefined();
      expect(common.getDefaultProviderAliases).toBe(getDefaultProviderAliases);
      expect(typeof common.getDefaultProviderAliases).toBe('function');
    });

    it("should be callable", () => {
      expect(() => common.getDefaultProviderAliases()).not.toThrow();
    });

    it("should return an object", () => {
      const result = common.getDefaultProviderAliases();
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe("proxyMode constants", () => {
    it("should export the proxyModeAuto constant", () => {
      expect(common.proxyModeAuto).toBeDefined();
      expect(common.proxyModeAuto).toBe(proxyModeAuto);
      expect(typeof common.proxyModeAuto).toBe('string');
    });

    it("should export the proxyModeProxy constant", () => {
      expect(common.proxyModeProxy).toBeDefined();
      expect(common.proxyModeProxy).toBe(proxyModeProxy);
      expect(typeof common.proxyModeProxy).toBe('string');
    });

    it("should export the proxyModeDirect constant", () => {
      expect(common.proxyModeDirect).toBeDefined();
      expect(common.proxyModeDirect).toBe(proxyModeDirect);
      expect(typeof common.proxyModeDirect).toBe('string');
    });

    it("should have proxy mode constants with expected values", () => {
      expect(common.proxyModeAuto).toBe('auto');
      expect(common.proxyModeProxy).toBe('proxy');
      expect(common.proxyModeDirect).toBe('direct');
    });

    it("should have lowercase proxy mode values", () => {
      expect(common.proxyModeAuto).toBe(common.proxyModeAuto.toLowerCase());
      expect(common.proxyModeProxy).toBe(common.proxyModeProxy.toLowerCase());
      expect(common.proxyModeDirect).toBe(common.proxyModeDirect.toLowerCase());
    });
  });

  describe("scriptManifestUrl constant", () => {
    it("should export the scriptManifestUrl constant", () => {
      expect(common.scriptManifestUrl).toBeDefined();
      expect(common.scriptManifestUrl).toBe(scriptManifestUrl);
      expect(typeof common.scriptManifestUrl).toBe('string');
    });

    it("should be a non-empty string", () => {
      expect(common.scriptManifestUrl).not.toBe('');
      expect(common.scriptManifestUrl.length).toBeGreaterThan(0);
    });
  });

  describe("localModuleExtensions constant", () => {
    it("should export the localModuleExtensions constant", () => {
      expect(common.localModuleExtensions).toBeDefined();
      expect(common.localModuleExtensions).toEqual(localModuleExtensions);
    });

    it("should be an array", () => {
      expect(Array.isArray(common.localModuleExtensions)).toBe(true);
    });

    it("should contain string values starting with a dot", () => {
      common.localModuleExtensions.forEach(ext => {
        expect(typeof ext).toBe('string');
        expect(ext.startsWith('.')).toBe(true);
      });
    });

    it("should include common JavaScript extensions", () => {
      expect(common.localModuleExtensions).toContain('.js');
      expect(common.localModuleExtensions).toContain('.ts');
      expect(common.localModuleExtensions).toContain('.jsx');
      expect(common.localModuleExtensions).toContain('.tsx');
    });

    it("should return a fresh array each time to avoid mutation leaks", () => {
      const arr1 = common.localModuleExtensions;
      const arr2 = common.localModuleExtensions;
      expect(arr1).not.toBe(arr2); // Different array instances
      expect(arr1).toEqual(arr2); // Same content
    });
  });

  describe("integration", () => {
    it("should maintain all original constant values", () => {
      expect(common.ciLogQueryParam).toBe(ciLogQueryParam);
      expect(common.clientLogEndpoint).toBe(clientLogEndpoint);
      expect(common.defaultFallbackProviders).toEqual(defaultFallbackProviders);
      expect(common.getDefaultProviderAliases).toBe(getDefaultProviderAliases);
      expect(common.proxyModeAuto).toBe(proxyModeAuto);
      expect(common.proxyModeProxy).toBe(proxyModeProxy);
      expect(common.proxyModeDirect).toBe(proxyModeDirect);
      expect(common.scriptManifestUrl).toBe(scriptManifestUrl);
      expect(common.localModuleExtensions).toEqual(localModuleExtensions);
    });

    it("should allow destructuring of all constants", () => {
      const {
        ciLogQueryParam: ciParam,
        clientLogEndpoint: clientEndpoint,
        defaultFallbackProviders: fallbackProviders,
        getDefaultProviderAliases: getAliases,
        proxyModeAuto: autoMode,
        proxyModeProxy: proxyMode,
        proxyModeDirect: directMode,
        scriptManifestUrl: manifestUrl,
        localModuleExtensions: extensions
      } = common;

      expect(ciParam).toBeDefined();
      expect(clientEndpoint).toBeDefined();
      expect(fallbackProviders).toBeDefined();
      expect(getAliases).toBeDefined();
      expect(autoMode).toBeDefined();
      expect(proxyMode).toBeDefined();
      expect(directMode).toBeDefined();
      expect(manifestUrl).toBeDefined();
      expect(extensions).toBeDefined();
    });

    it("should have consistent proxy mode values", () => {
      expect(common.proxyModeAuto).toBe('auto');
      expect(common.proxyModeProxy).toBe('proxy');
      expect(common.proxyModeDirect).toBe('direct');
    });
  });

  describe("edge cases", () => {
    it("should handle potential mutations safely", () => {
      const originalProviders = [...common.defaultFallbackProviders];
      const originalExtensions = [...common.localModuleExtensions];

      // Try to mutate the arrays
      common.defaultFallbackProviders.push('test');
      common.localModuleExtensions.push('.test');

      // Get fresh instances to verify they weren't mutated
      const freshProviders = common.defaultFallbackProviders;
      const freshExtensions = common.localModuleExtensions;

      expect(freshProviders).toEqual(originalProviders);
      expect(freshExtensions).toEqual(originalExtensions);
    });

    it("should not have any undefined values", () => {
      const exportedValues = Object.values(common);
      exportedValues.forEach(value => {
        expect(value).not.toBeUndefined();
      });
    });
  });
});