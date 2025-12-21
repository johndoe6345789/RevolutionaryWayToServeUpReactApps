describe("bootstrap/configs/cdn/dynamic-modules.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/cdn/dynamic-modules.js")).toBeDefined();
  });
});
