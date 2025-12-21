describe("bootstrap/configs/local/sass-compiler.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/sass-compiler.js")).toBeDefined();
  });
});
