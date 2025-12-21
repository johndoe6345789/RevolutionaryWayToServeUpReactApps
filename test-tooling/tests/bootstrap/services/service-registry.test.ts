describe("bootstrap/services/service-registry.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../bootstrap/services/service-registry.js")).toBeDefined();
  });
});
