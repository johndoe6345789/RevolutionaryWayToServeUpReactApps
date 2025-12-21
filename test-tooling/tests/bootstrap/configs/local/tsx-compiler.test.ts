describe("bootstrap/configs/local/tsx-compiler.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/tsx-compiler.js")).toBeDefined();
  });
});
