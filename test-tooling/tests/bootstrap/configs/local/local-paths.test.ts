describe("bootstrap/configs/local/local-paths.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/local/local-paths.js")).toBeDefined();
  });
});
