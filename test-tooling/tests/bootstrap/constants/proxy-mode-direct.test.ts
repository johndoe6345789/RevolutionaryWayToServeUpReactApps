const proxyModeDirect = require("../../../../bootstrap/constants/proxy-mode-direct.js");

describe("bootstrap/constants/proxy-mode-direct.js", () => {
  it("exports the direct proxy mode token", () => {
    expect(proxyModeDirect).toBe("direct");
  });

  it("asserts the directive string stays lowercase", () => {
    expect(proxyModeDirect).toBe(proxyModeDirect.toLowerCase());
  });
});
