describe("bootstrap/cdn/dynamic-modules.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/cdn/dynamic-modules.js")).toBeDefined();
  });
});
