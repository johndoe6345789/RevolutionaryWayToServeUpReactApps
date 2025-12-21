describe("bootstrap/initializers/loaders/local-module-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/initializers/loaders/local-module-loader.js")).toBeDefined();
  });
});
