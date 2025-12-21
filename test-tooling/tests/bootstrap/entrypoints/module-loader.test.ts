describe("bootstrap/entrypoints/module-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/entrypoints/module-loader.js")).toBeDefined();
  });
});
