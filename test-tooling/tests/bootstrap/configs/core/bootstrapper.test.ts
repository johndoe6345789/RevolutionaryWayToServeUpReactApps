describe("bootstrap/configs/core/bootstrapper.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/core/bootstrapper.js")).toBeDefined();
  });
});
