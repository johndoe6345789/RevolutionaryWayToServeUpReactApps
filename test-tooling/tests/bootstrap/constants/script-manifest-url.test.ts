const scriptManifestUrl = require("../../../../bootstrap/constants/script-manifest-url.js");

describe("bootstrap/constants/script-manifest-url.js", () => {
  it("exports the bootstrap script manifest path", () => {
    expect(scriptManifestUrl).toBe("bootstrap/entrypoints/script-list.html");
  });

  it("can be resolved relative to the bootstrap asset path", () => {
    expect(scriptManifestUrl.startsWith("bootstrap/")).toBe(true);
  });
});
