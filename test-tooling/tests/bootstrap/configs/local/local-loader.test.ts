describe("bootstrap/configs/local/local-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/local-loader.js")).toBeDefined();
  });
});
