const BaseHelper = require("../../../../bootstrap/helpers/base-helper.js");

describe("bootstrap/helpers/base-helper.js", () => {
  it("requires a helper registry before registering helpers", () => {
    const helper = new BaseHelper();
    expect(() => helper._resolveHelperRegistry()).toThrow(
      "HelperRegistry required for BaseHelper"
    );
  });

  it("registers helpers that are not yet registered", () => {
    const registry = {
      isRegistered: jest.fn().mockReturnValue(false),
      register: jest.fn(),
    };

    class TestHelper extends BaseHelper {
      initialize() {
        this._registerHelper("sample", { ok: true }, { scope: "local" });
      }
    }

    const helper = new TestHelper({ helperRegistry: registry });
    helper.initialize();

    expect(registry.register).toHaveBeenCalledWith(
      "sample",
      { ok: true },
      { scope: "local" }
    );
  });

  it("skips registration if the helper already exists", () => {
    const registry = {
      isRegistered: jest.fn().mockReturnValue(true),
      register: jest.fn(),
    };

    class TestHelper extends BaseHelper {
      initialize() {
        this._registerHelper("existing", { ok: true });
      }
    }

    const helper = new TestHelper({ helperRegistry: registry });
    helper.initialize();

    expect(registry.register).not.toHaveBeenCalled();
  });

  it("throws when initialize is not implemented", () => {
    const helper = new BaseHelper();
    expect(() => helper.initialize()).toThrow("BaseHelper must implement initialize()");
  });
});
