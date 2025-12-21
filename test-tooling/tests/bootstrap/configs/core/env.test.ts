describe("bootstrap/configs/core/env.js", () => {
  it("loads without throwing", () => {
    expect(require("../../../../../bootstrap/configs/core/env.js")).toBeDefined();
  });
});
