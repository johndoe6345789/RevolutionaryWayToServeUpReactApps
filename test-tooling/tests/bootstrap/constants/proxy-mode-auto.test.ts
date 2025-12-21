const proxyModeAuto = require("../../../../bootstrap/constants/proxy-mode-auto.js");

describe("bootstrap/constants/proxy-mode-auto.js", () => {
  it("exports the automatic proxy mode token", () => {
    expect(proxyModeAuto).toBe("auto");
  });

  it("remains lowercase so normalization remains idempotent", () => {
    expect(proxyModeAuto).toBe(proxyModeAuto.toLowerCase());
  });
});
