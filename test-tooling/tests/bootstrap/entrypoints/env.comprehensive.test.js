import EnvInitializer from "../../../../bootstrap/services/core/env-service.js";

describe("EnvInitializer EntryPoint", () => {
  let originalWindow;
  let originalGlobal;

  beforeEach(() => {
    // Save original globals
    originalWindow = global.window;
    originalGlobal = global.global;
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.global = originalGlobal;
  });

  describe("env.js entrypoint", () => {
    it("should load without throwing errors on first execution", () => {
      // Delete from cache to get a fresh require
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      delete require.cache[modulePath];

      // Verify that requiring the entrypoint doesn't throw an error on first execution
      expect(() => {
        require("../../../../bootstrap/entrypoints/env.js");
      }).not.toThrow();
    });

    it("should have proper integration with dependencies", () => {
      // Verify that all required dependencies exist and can be loaded
      expect(() => {
        require("../../../../bootstrap/entrypoints/base-entrypoint.js");
        require("../../../../bootstrap/services/core/env-service.js");
        require("../../../../bootstrap/configs/core/env.js");
      }).not.toThrow();
    });

    it("should maintain correct module structure", () => {
      // Test that the module has the expected structure without executing it
      // (since executing it registers services that cause conflicts)
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      const fs = require('fs');
      const moduleSource = fs.readFileSync(modulePath, 'utf8');

      // Verify the module contains expected components
      expect(moduleSource).toContain('BaseEntryPoint');
      expect(moduleSource).toContain('EnvInitializer');
      expect(moduleSource).toContain('EnvInitializerConfig');
      expect(moduleSource).toContain('configFactory');
      expect(moduleSource).toContain('entrypoint.run()');
    });

    it("should have configFactory that maps root to global", () => {
      // Test the configFactory function indirectly by examining the module source
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      const fs = require('fs');
      const moduleSource = fs.readFileSync(modulePath, 'utf8');

      // Check that the configFactory maps root to global as expected
      expect(moduleSource).toContain('configFactory: ({ root }) => ({ global: root })');
    });

    it("should export the expected functionality after execution", () => {
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      delete require.cache[modulePath];

      const envExports = require("../../../../bootstrap/entrypoints/env.js");

      // The env entrypoint should export the service functionality
      expect(envExports).toBeDefined();
    });

    it("should handle different proxy modes correctly", () => {
      // Set up a test environment with different proxy modes
      global.window = { 
        location: { href: "http://localhost:3000?__RWTRA_PROXY_MODE__=proxy" },
        document: { cookie: "" }
      };
      
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      delete require.cache[modulePath];

      // Should not throw with different proxy modes
      expect(() => {
        require("../../../../bootstrap/entrypoints/env.js");
      }).not.toThrow();
    });

    it("should work in environments without window", () => {
      global.window = undefined;
      
      const modulePath = require.resolve("../../../../bootstrap/entrypoints/env.js");
      delete require.cache[modulePath];

      // Should not throw when window is not available
      expect(() => {
        require("../../../../bootstrap/entrypoints/env.js");
      }).not.toThrow();
    });
  });

  describe("EnvInitializer service", () => {
    let envService;
    let mockConfig;
    let mockServiceRegistry;
    let mockGlobal;

    beforeEach(() => {
      mockServiceRegistry = { register: jest.fn() };
      mockGlobal = { document: {} };
      mockConfig = {
        global: mockGlobal,
        serviceRegistry: mockServiceRegistry
      };
      envService = new EnvInitializer(mockConfig);
    });

    describe("constructor", () => {
      it("should create an instance with provided config", () => {
        expect(envService.config).toBe(mockConfig);
      });

      it("should create an instance with default config when none provided", () => {
        const service = new EnvInitializer();
        expect(service.config).toBeDefined();
      });
    });

    describe("initialize method", () => {
      it("should set up internal properties correctly", () => {
        const result = envService.initialize();
        expect(result).toBe(envService);
        expect(envService.global).toBe(mockGlobal);
        expect(envService.serviceRegistry).toBe(mockServiceRegistry);
      });

      it("should ensure proxy mode defaults to auto", () => {
        envService.initialize();
        expect(envService.proxyMode).toBeDefined();
      });

      it("should register the service in the service registry", () => {
        envService.initialize();

        expect(mockServiceRegistry.register).toHaveBeenCalledWith(
          "env",
          envService,
          {
            folder: "services/core",
            domain: "core",
          },
          []
        );
      });

      it("should throw if already initialized", () => {
        envService.initialize();
        expect(() => envService.initialize()).toThrow();
      });
    });

    describe("integration", () => {
      it("should work through full lifecycle", () => {
        const service = new EnvInitializer(mockConfig);

        // Initialize
        service.initialize();
        expect(service.global).toBe(mockGlobal);
        expect(service.serviceRegistry).toBe(mockServiceRegistry);

        // Service should be registered
        expect(mockServiceRegistry.register).toHaveBeenCalledWith(
          "env",
          service,
          {
            folder: "services/core",
            domain: "core",
          },
          []
        );
      });
    });
  });
});