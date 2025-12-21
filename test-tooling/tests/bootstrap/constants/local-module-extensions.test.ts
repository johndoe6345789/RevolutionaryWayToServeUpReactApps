const localModuleExtensions = require("../../../../bootstrap/constants/local-module-extensions.js");

describe("bootstrap/constants/local-module-extensions.js", () => {
  it("publishes the supported source extensions", () => {
    expect(Array.isArray(localModuleExtensions)).toBe(true);
    expect(localModuleExtensions).toContain(".tsx");
    expect(localModuleExtensions).toContain(".js");
  });

  it("includes an empty string to allow bare require/dir matches", () => {
    expect(localModuleExtensions[0]).toBe("");
  });
});
