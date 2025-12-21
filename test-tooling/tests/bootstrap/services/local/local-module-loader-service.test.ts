describe("bootstrap/services/local/local-module-loader-service.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/services/local/local-module-loader-service.js")).toBeDefined();
  });
});
