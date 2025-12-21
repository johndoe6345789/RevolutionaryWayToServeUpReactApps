describe("bootstrap/configs/core/module-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/core/module-loader.js")).toBeDefined();
  });
});
