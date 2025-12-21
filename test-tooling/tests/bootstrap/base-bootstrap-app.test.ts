describe("bootstrap/base-bootstrap-app.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../bootstrap/base-bootstrap-app.js")).toBeDefined();
  });
});
