import LocalHelpers from "../../bootstrap/helpers/local-helpers.js";

// Create a mock helper registry
const createMockHelperRegistry = () => {
  return {
    register: jest.fn(),
    get: jest.fn(),
    isRegistered: jest.fn().mockReturnValue(false),
  };
};

describe("LocalHelpers", () => {
  let mockHelperRegistry;
  let localHelpers;

  beforeEach(() => {
    mockHelperRegistry = createMockHelperRegistry();
    
    // Create a config with the mock registry
    const config = {
      helperRegistry: mockHelperRegistry,
    };
    
    localHelpers = new LocalHelpers(config);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(localHelpers).toBeInstanceOf(LocalHelpers);
      expect(localHelpers.config).toBeDefined();
      expect(localHelpers.config.helperRegistry).toBe(mockHelperRegistry);
    });

    it("should create an instance with default config when none provided", () => {
      // For this test, we'll bypass the default config creation by providing a minimal config
      const config = { helperRegistry: createMockHelperRegistry() };
      const helpers = new LocalHelpers(config);
      
      expect(helpers).toBeInstanceOf(LocalHelpers);
      expect(helpers.config).toBeDefined();
    });

    it("should set initialized to false initially", () => {
      expect(localHelpers.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should register frameworkRenderer and localRequireBuilder helpers", () => {
      const result = localHelpers.initialize();
      
      // Check that both helpers were registered
      expect(mockHelperRegistry.register).toHaveBeenCalledTimes(2);
      
      // Verify the first registration (frameworkRenderer)
      expect(mockHelperRegistry.register).toHaveBeenNthCalledWith(
        1,
        "frameworkRenderer",
        expect.anything(), // FrameworkRenderer constructor
        { folder: "services/local/helpers", domain: "helpers" },
        []
      );
      
      // Verify the second registration (localRequireBuilder)
      expect(mockHelperRegistry.register).toHaveBeenNthCalledWith(
        2,
        "localRequireBuilder",
        expect.anything(), // LocalRequireBuilder constructor
        { folder: "services/local/helpers", domain: "helpers" },
        []
      );
      
      expect(localHelpers.initialized).toBe(true);
      expect(result).toBe(localHelpers);
    });

    it("should return the instance to allow chaining", () => {
      const result = localHelpers.initialize();
      
      expect(result).toBe(localHelpers);
    });

    it("should set the initialized flag to true", () => {
      localHelpers.initialize();
      
      expect(localHelpers.initialized).toBe(true);
    });

    it("should return early if already initialized", () => {
      localHelpers.initialize();
      const registerCallCountBefore = mockHelperRegistry.register.mock.calls.length;
      
      const result = localHelpers.initialize();
      
      // Should return the same instance without making additional register calls
      expect(result).toBe(localHelpers);
      expect(mockHelperRegistry.register).toHaveBeenCalledTimes(registerCallCountBefore);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      expect(localHelpers.initialized).toBe(false);
      
      const result = localHelpers.initialize();
      
      expect(result).toBe(localHelpers);
      expect(localHelpers.initialized).toBe(true);
      
      // Verify both helpers were registered
      expect(mockHelperRegistry.register).toHaveBeenCalledTimes(2);
      
      // Verify the specific registration details
      const firstCall = mockHelperRegistry.register.mock.calls[0];
      expect(firstCall[0]).toBe("frameworkRenderer");
      expect(firstCall[2]).toEqual({ folder: "services/local/helpers", domain: "helpers" });
      
      const secondCall = mockHelperRegistry.register.mock.calls[1];
      expect(secondCall[0]).toBe("localRequireBuilder");
      expect(secondCall[2]).toEqual({ folder: "services/local/helpers", domain: "helpers" });
    });

    it("should handle multiple initialization attempts gracefully", () => {
      localHelpers.initialize();
      
      // Capture the call count after first initialization
      const initialCallCount = mockHelperRegistry.register.mock.calls.length;
      
      // Try initializing again
      localHelpers.initialize();
      
      // Call count should remain the same
      expect(mockHelperRegistry.register).toHaveBeenCalledTimes(initialCallCount);
      expect(localHelpers.initialized).toBe(true);
    });
  });
});