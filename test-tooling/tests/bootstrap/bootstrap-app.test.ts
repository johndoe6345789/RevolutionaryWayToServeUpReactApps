describe("bootstrap/bootstrap-app.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../bootstrap/bootstrap-app.js")).toBeDefined();
  });
});
