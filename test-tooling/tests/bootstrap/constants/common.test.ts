const common = require("../../../../bootstrap/constants/common.js");
const ciLogQueryParam = require("../../../../bootstrap/constants/ci-log-query-param.js");
const clientLogEndpoint = require("../../../../bootstrap/constants/client-log-endpoint.js");
const defaultFallbackProviders = require("../../../../bootstrap/constants/default-fallback-providers.js");
const getDefaultProviderAliases = require("../../../../bootstrap/constants/default-provider-aliases.js");
const proxyModeAuto = require("../../../../bootstrap/constants/proxy-mode-auto.js");
const proxyModeDirect = require("../../../../bootstrap/constants/proxy-mode-direct.js");
const proxyModeProxy = require("../../../../bootstrap/constants/proxy-mode-proxy.js");
const scriptManifestUrl = require("../../../../bootstrap/constants/script-manifest-url.js");
const localModuleExtensions = require("../../../../bootstrap/constants/local-module-extensions.js");

describe("bootstrap/constants/common.js", () => {
  it("re-exports the shared bootstrap constants", () => {
    expect(common.ciLogQueryParam).toBe(ciLogQueryParam);
    expect(common.clientLogEndpoint).toBe(clientLogEndpoint);
    expect(common.defaultFallbackProviders).toEqual(defaultFallbackProviders);
    expect(common.getDefaultProviderAliases).toBe(getDefaultProviderAliases);
    expect(common.proxyModeAuto).toBe(proxyModeAuto);
    expect(common.proxyModeDirect).toBe(proxyModeDirect);
    expect(common.proxyModeProxy).toBe(proxyModeProxy);
    expect(common.scriptManifestUrl).toBe(scriptManifestUrl);
    expect(common.localModuleExtensions).toEqual(localModuleExtensions);
  });

  it("describes the expected defaults for fallback providers and extensions", () => {
    expect(Array.isArray(common.defaultFallbackProviders)).toBe(true);
    expect(common.localModuleExtensions).toContain(".js");
  });
});
