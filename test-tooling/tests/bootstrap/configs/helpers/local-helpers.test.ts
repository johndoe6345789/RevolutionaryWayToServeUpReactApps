describe("bootstrap/configs/helpers/local-helpers.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/helpers/local-helpers.js")).toBeDefined();
  });
});
