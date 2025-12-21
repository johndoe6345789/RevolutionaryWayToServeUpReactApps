const BaseBootstrapApp = require("../../../bootstrap/base-bootstrap-app.js");

describe("bootstrap/base-bootstrap-app.js", () => {
  it("detects browser-like wrappers by examining document presence", () => {
    expect(BaseBootstrapApp.isBrowser({ document: {} })).toBe(true);
    expect(BaseBootstrapApp.isBrowser({})).toBe(false);
  });

  it("resolves helpers through require when CommonJS is enabled", () => {
    const instance = new BaseBootstrapApp();
    instance.isCommonJs = true;

    const loggingHelper = instance._resolveHelper("logging", "./cdn/logging.js");
    expect(loggingHelper).toBeDefined();
    expect(loggingHelper.logClient).toBeDefined();
  });

  it("prefers the helper namespace when CommonJS is disabled", () => {
    const instance = new BaseBootstrapApp();
    instance.isCommonJs = false;
    instance.helpersNamespace = { custom: { value: "ok" } };

    const helper = instance._resolveHelper("custom", "./cdn/logging.js");
    expect(helper).toEqual({ value: "ok" });
  });
});
