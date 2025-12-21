describe("bootstrap/entrypoints/script-list-loader.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.unmock("../../../../bootstrap/services/core/script-list-loader-service.js");
  });

  it("initializes and loads the script list loader", () => {
    const initializeSpy = jest.fn();
    const loadSpy = jest.fn();

    jest.doMock("../../../../bootstrap/services/core/script-list-loader-service.js", () => {
      return jest.fn().mockImplementation(() => ({
        initialize: initializeSpy,
        load: loadSpy,
      }));
    });

    jest.isolateModules(() => {
      require("../../../../bootstrap/entrypoints/script-list-loader.js");
    });

    expect(initializeSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
  });

  it("does not expose an export surface", () => {
    const initializeSpy = jest.fn();
    const loadSpy = jest.fn();

    jest.doMock("../../../../bootstrap/services/core/script-list-loader-service.js", () => {
      return jest.fn().mockImplementation(() => ({
        initialize: initializeSpy,
        load: loadSpy,
      }));
    });

    let result;
    jest.isolateModules(() => {
      result = require("../../../../bootstrap/entrypoints/script-list-loader.js");
    });

    expect(result).toEqual({});
    expect(initializeSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
  });
});
