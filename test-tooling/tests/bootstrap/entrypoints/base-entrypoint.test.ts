const serviceRegistry = { register: jest.fn() };
const rootHandler = {
  root: { name: "root" },
  getNamespace: () => ({ helpers: {} }),
  getDocument: () => ({ documentElement: true }),
};

jest.mock("../../../../bootstrap/services/service-registry-instance.js", () => serviceRegistry);
jest.mock("../../../../bootstrap/constants/global-root-handler.js", () => {
  return jest.fn().mockImplementation(() => rootHandler);
});

const BaseEntryPoint = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

describe("bootstrap/entrypoints/base-entrypoint.js", () => {
  it("creates the config using the root handler and registry", () => {
    const configFactory = jest.fn(({ serviceRegistry, root, namespace, document }) => ({
      serviceRegistry,
      root,
      namespace,
      document,
      custom: "ok",
    }));

    class ConfigClass {
      constructor(opts) {
        this.opts = opts;
      }
    }

    class ServiceClass {
      constructor(config) {
        this.config = config;
      }

      initialize() {
        return this;
      }
    }

    const entrypoint = new BaseEntryPoint({
      ServiceClass,
      ConfigClass,
      configFactory,
    });

    const service = entrypoint.run();

    expect(configFactory).toHaveBeenCalledWith({
      serviceRegistry,
      root: rootHandler.root,
      namespace: rootHandler.getNamespace(),
      document: rootHandler.getDocument(),
    });
    expect(service.config.opts.custom).toBe("ok");
  });

  it("exposes the generated config via _createConfig", () => {
    const configFactory = jest.fn(() => ({ custom: "value" }));

    class ConfigClass {
      constructor(opts) {
        this.opts = opts;
      }
    }

    class ServiceClass {
      initialize() {
        return this;
      }
    }

    const entrypoint = new BaseEntryPoint({
      ServiceClass,
      ConfigClass,
      configFactory,
    });

    const config = entrypoint._createConfig();
    expect(config.opts.custom).toBe("value");
  });

  it("invokes install when the service implements it", () => {
    const installSpy = jest.fn();

    class ConfigClass {
      constructor(opts) {
        this.opts = opts;
      }
    }

    class ServiceClass {
      initialize() {
        return this;
      }

      install() {
        installSpy();
      }
    }

    const entrypoint = new BaseEntryPoint({
      ServiceClass,
      ConfigClass,
    });

    entrypoint.run();
    expect(installSpy).toHaveBeenCalled();
  });
});
