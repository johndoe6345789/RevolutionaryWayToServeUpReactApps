describe("bootstrap/configs/local/local-dependency-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/local-dependency-loader.js")).toBeDefined();
  });
});
