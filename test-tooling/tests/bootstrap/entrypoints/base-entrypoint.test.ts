describe("bootstrap/entrypoints/base-entrypoint.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/entrypoints/base-entrypoint.js")).toBeDefined();
  });
});
