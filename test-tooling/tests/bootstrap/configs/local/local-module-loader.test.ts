describe("bootstrap/configs/local/local-module-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/local-module-loader.js")).toBeDefined();
  });
});
