describe("bootstrap/initializers/compilers/sass-compiler.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/initializers/compilers/sass-compiler.js")).toBeDefined();
  });
});
