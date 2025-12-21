describe("bootstrap/entrypoints/env.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/entrypoints/env.js")).toBeDefined();
  });
});
