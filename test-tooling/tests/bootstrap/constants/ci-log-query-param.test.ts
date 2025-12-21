const ciLogQueryParam = require("../../../../bootstrap/constants/ci-log-query-param.js");

describe("bootstrap/constants/ci-log-query-param.js", () => {
  it("exports the expected CI flag name", () => {
    expect(typeof ciLogQueryParam).toBe("string");
    expect(ciLogQueryParam).toBe("ci");
  });

  it("can be used to build query strings that toggle CI logging", () => {
    const query = new URLSearchParams({ [ciLogQueryParam]: "1" }).toString();
    expect(query).toBe(`${ciLogQueryParam}=1`);
  });
});
