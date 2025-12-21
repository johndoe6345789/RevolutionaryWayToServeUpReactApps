describe("bootstrap/cdn/network-entrypoint.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/cdn/network-entrypoint.js")).toBeDefined();
  });
});
