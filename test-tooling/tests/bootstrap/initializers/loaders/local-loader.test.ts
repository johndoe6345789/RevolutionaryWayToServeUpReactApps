describe("bootstrap/initializers/loaders/local-loader.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/initializers/loaders/local-loader.js")).toBeDefined();
  });
});
