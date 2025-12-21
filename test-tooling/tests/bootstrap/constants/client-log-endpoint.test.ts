const clientLogEndpoint = require("../../../../bootstrap/constants/client-log-endpoint.js");

describe("bootstrap/constants/client-log-endpoint.js", () => {
  it("exports the configured client log endpoint path", () => {
    expect(clientLogEndpoint).toBe("/__client-log");
  });

  it("produces a string that can be concatenated with query data", () => {
    expect(`${clientLogEndpoint}?event=bootstrap`).toContain("bootstrap");
  });
});
