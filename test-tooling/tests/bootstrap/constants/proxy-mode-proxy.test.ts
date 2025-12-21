const proxyModeProxy = require("../../../../bootstrap/constants/proxy-mode-proxy.js");

describe("bootstrap/constants/proxy-mode-proxy.js", () => {
  it("exports the proxy-only proxy mode token", () => {
    expect(proxyModeProxy).toBe("proxy");
  });

  it("does not change when normalized to lower case", () => {
    expect(proxyModeProxy).toBe(proxyModeProxy.toLowerCase());
  });
});
