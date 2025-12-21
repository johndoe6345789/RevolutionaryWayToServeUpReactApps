const NetworkProviderServiceConfig = require("../../../../../bootstrap/configs/cdn/network-provider-service.js");
const {
  defaultFallbackProviders,
  getDefaultProviderAliases,
  proxyModeAuto,
  proxyModeProxy,
  proxyModeDirect,
} = require("../../../../../bootstrap/constants/common.js");

describe("bootstrap/configs/cdn/network-provider-service.js", () => {
  it("derives defaults from the shared constants", () => {
    const globalObject = {};
    const config = new NetworkProviderServiceConfig({ globalObject, isCommonJs: false });

    expect(config.globalObject).toBe(globalObject);
    expect(config.defaultFallbackProviders).toEqual(defaultFallbackProviders);
    expect(config.defaultFallbackProviders).not.toBe(defaultFallbackProviders);
    expect(config.fallbackProviders).toEqual(defaultFallbackProviders);
    expect(config.fallbackProviders).not.toBe(defaultFallbackProviders);
    expect(config.defaultProviderAliases).toEqual(
      getDefaultProviderAliases(globalObject, false)
    );
    expect(config.defaultProviderBase).toBe("");
    expect(config.proxyModeAuto).toBe(proxyModeAuto);
    expect(config.proxyModeProxy).toBe(proxyModeProxy);
    expect(config.proxyModeDirect).toBe(proxyModeDirect);
  });

  it("copies provided fallback providers and default values", () => {
    const fallbackProviders = ["https://cdn1.test"];
    const defaultFallbackProviders = ["https://cdn-default.test"];
    const config = new NetworkProviderServiceConfig({
      fallbackProviders,
      defaultFallbackProviders,
      defaultProviderBase: "default",
      defaultProviderAliases: { react: "react-dom" },
    });

    expect(config.defaultFallbackProviders).toEqual(defaultFallbackProviders);
    expect(config.defaultFallbackProviders).not.toBe(defaultFallbackProviders);
    expect(config.fallbackProviders).toEqual(fallbackProviders);
    expect(config.fallbackProviders).not.toBe(fallbackProviders);
    expect(config.defaultProviderBase).toBe("default");
    expect(config.defaultProviderAliases).toEqual({ react: "react-dom" });
  });
});
