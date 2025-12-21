import BaseEntryPoint from "../../bootstrap/entrypoints/base-entrypoint.js";

// Mock the dependencies
jest.mock("../../bootstrap/services/service-registry-instance.js", () => {
  return {};
});

jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        root: { document: {}, fetch: jest.fn() },
        getNamespace: jest.fn().mockReturnValue({}),
        getDocument: jest.fn().mockReturnValue({}),
      };
    })
  };
});

describe("BaseEntryPoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with ServiceClass, ConfigClass, and configFactory", () => {
      const mockServiceClass = class {};
      const mockConfigClass = class {};
      const mockConfigFactory = jest.fn();
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      expect(entryPoint.ServiceClass).toBe(mockServiceClass);
      expect(entryPoint.ConfigClass).toBe(mockConfigClass);
      expect(entryPoint.configFactory).toBe(mockConfigFactory);
      expect(entryPoint.rootHandler).toBeDefined();
    });

    it("should use default configFactory when not provided", () => {
      const mockServiceClass = class {};
      const mockConfigClass = class {};
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass
      });
      
      expect(typeof entryPoint.configFactory).toBe('function');
      expect(entryPoint.configFactory()).toEqual({});
    });

    it("should create a GlobalRootHandler instance", () => {
      const mockServiceClass = class {};
      const mockConfigClass = class {};
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass
      });
      
      expect(require("../../bootstrap/constants/global-root-handler.js").default).toHaveBeenCalled();
      expect(entryPoint.rootHandler).toBeDefined();
    });
  });

  describe("_createConfig method", () => {
    it("should create config with serviceRegistry and overrides", () => {
      const mockConfigClass = jest.fn().mockImplementation((config) => config);
      const mockConfigFactory = jest.fn().mockReturnValue({ customProp: "value" });
      const mockServiceRegistry = {};
      
      // Mock service registry import
      jest.doMock("../../bootstrap/services/service-registry-instance.js", () => mockServiceRegistry);
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: class {},
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      const config = entryPoint._createConfig();
      
      expect(mockConfigFactory).toHaveBeenCalledWith({
        serviceRegistry: mockServiceRegistry,
        root: expect.any(Object),
        namespace: expect.any(Object),
        document: expect.any(Object),
      });
      
      expect(mockConfigClass).toHaveBeenCalledWith({
        serviceRegistry: mockServiceRegistry,
        customProp: "value"
      });
      
      expect(config.serviceRegistry).toBe(mockServiceRegistry);
      expect(config.customProp).toBe("value");
    });

    it("should create config with only serviceRegistry when factory returns empty object", () => {
      const mockConfigClass = jest.fn().mockImplementation((config) => config);
      const mockConfigFactory = jest.fn().mockReturnValue({});
      const mockServiceRegistry = {};
      
      // Mock service registry import
      jest.doMock("../../bootstrap/services/service-registry-instance.js", () => mockServiceRegistry);
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: class {},
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      const config = entryPoint._createConfig();
      
      expect(mockConfigClass).toHaveBeenCalledWith({
        serviceRegistry: mockServiceRegistry
      });
    });
  });

  describe("run method", () => {
    it("should instantiate service, call initialize, and return service", () => {
      const mockConfig = { someConfig: "value" };
      const mockServiceInstance = {
        initialize: jest.fn(),
        install: jest.fn()
      };
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation(() => mockConfig);
      const mockConfigFactory = jest.fn().mockReturnValue({});
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      // Mock _createConfig to return our mock config
      jest.spyOn(entryPoint, '_createConfig').mockReturnValue(mockConfig);
      
      const result = entryPoint.run();
      
      expect(mockServiceClass).toHaveBeenCalledWith(mockConfig);
      expect(mockServiceInstance.initialize).toHaveBeenCalled();
      expect(result).toBe(mockServiceInstance);
    });

    it("should call install method if it exists on service", () => {
      const mockConfig = { someConfig: "value" };
      const mockServiceInstance = {
        initialize: jest.fn(),
        install: jest.fn()
      };
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation(() => mockConfig);
      const mockConfigFactory = jest.fn().mockReturnValue({});
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      // Mock _createConfig to return our mock config
      jest.spyOn(entryPoint, '_createConfig').mockReturnValue(mockConfig);
      
      const result = entryPoint.run();
      
      expect(mockServiceInstance.install).toHaveBeenCalled();
      expect(result).toBe(mockServiceInstance);
    });

    it("should not call install method if it does not exist on service", () => {
      const mockConfig = { someConfig: "value" };
      const mockServiceInstance = {
        initialize: jest.fn()
        // No install method
      };
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation(() => mockConfig);
      const mockConfigFactory = jest.fn().mockReturnValue({});
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      // Mock _createConfig to return our mock config
      jest.spyOn(entryPoint, '_createConfig').mockReturnValue(mockConfig);
      
      const result = entryPoint.run();
      
      expect(result).toBe(mockServiceInstance);
    });

    it("should throw error if service initialize method fails", () => {
      const mockConfig = { someConfig: "value" };
      const mockServiceInstance = {
        initialize: jest.fn().mockImplementation(() => {
          throw new Error("Initialization failed");
        })
      };
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation(() => mockConfig);
      const mockConfigFactory = jest.fn().mockReturnValue({});
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      // Mock _createConfig to return our mock config
      jest.spyOn(entryPoint, '_createConfig').mockReturnValue(mockConfig);
      
      expect(() => entryPoint.run()).toThrow("Initialization failed");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with all methods", () => {
      // Create a mock service that implements all expected methods
      const initializeSpy = jest.fn();
      const installSpy = jest.fn();
      const mockServiceInstance = {
        initialize: initializeSpy,
        install: installSpy
      };
      
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation((config) => config);
      const mockConfigFactory = jest.fn().mockReturnValue({ test: "config" });
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      const result = entryPoint.run();
      
      // Verify the service was created with config
      expect(mockServiceClass).toHaveBeenCalledWith(expect.objectContaining({ test: "config" }));
      
      // Verify initialize was called
      expect(initializeSpy).toHaveBeenCalled();
      
      // Verify install was called since it exists
      expect(installSpy).toHaveBeenCalled();
      
      // Verify the service instance was returned
      expect(result).toBe(mockServiceInstance);
    });

    it("should work with service that only has initialize method", () => {
      // Create a mock service that only has initialize
      const initializeSpy = jest.fn();
      const mockServiceInstance = {
        initialize: initializeSpy
        // No install method
      };
      
      const mockServiceClass = jest.fn().mockImplementation(() => mockServiceInstance);
      const mockConfigClass = jest.fn().mockImplementation((config) => config);
      const mockConfigFactory = jest.fn().mockReturnValue({ test: "config" });
      
      const entryPoint = new BaseEntryPoint({
        ServiceClass: mockServiceClass,
        ConfigClass: mockConfigClass,
        configFactory: mockConfigFactory
      });
      
      const result = entryPoint.run();
      
      // Verify the service was created with config
      expect(mockServiceClass).toHaveBeenCalledWith(expect.objectContaining({ test: "config" }));
      
      // Verify initialize was called
      expect(initializeSpy).toHaveBeenCalled();
      
      // Verify the service instance was returned
      expect(result).toBe(mockServiceInstance);
    });
  });
});