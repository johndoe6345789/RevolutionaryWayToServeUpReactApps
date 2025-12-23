/**
 * Plugin Test Suite
 * Tests for the Plugin base class
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Plugin } from './plugin';
import type { IPluginRegistryManager, ISpec } from './interfaces/index';

describe('Plugin', () => {
  let mockSpec: ISpec, plugin: Plugin;

  beforeEach(() => {
    mockSpec = {
      uuid: 'test-uuid-789',
      id: 'test-plugin',
      type: 'plugin',
      search: {
        title: 'Test Plugin',
        summary: 'Test plugin for unit testing',
        keywords: ['test', 'plugin'],
        domain: 'test',
        capabilities: ['testing'],
      },
    };

    // Create a concrete implementation for testing
    /**
     *
     */
    class TestPlugin extends Plugin {
      constructor(spec: ISpec) {
        super(spec);
      }
    }

    plugin = new TestPlugin(mockSpec);
  });

  describe('constructor', () => {
    it('should initialize with valid spec', () => {
      expect(plugin).toBeDefined();
      expect(plugin.uuid).toBe(mockSpec.uuid);
      expect(plugin.id).toBe(mockSpec.id);
    });

    it('should not be initialized initially', () => {
      // Create a plugin instance to check initial state
      const freshPlugin = new (class extends Plugin {
        constructor() {
          super(mockSpec);
        }
        /**
         *
         */
        isInitialized() {
          return (this as any).initialised;
        }
      })();
      expect(freshPlugin.isInitialized()).toBe(false);
    });
  });

  describe('initialise', () => {
    it('should initialize successfully', async () => {
      const result = await plugin.initialise();
      expect(result).toBe(plugin);
      // Create a plugin instance to check initialized state
      const initializedPlugin = new (class extends Plugin {
          constructor() {
            super(mockSpec);
          }
          /**
           *
           */
          async initializeAndCheck() {
            await this.initialise();

            return (this as any).initialised;
          }
        })(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        isInitialized = await initializedPlugin.initializeAndCheck();
      expect(isInitialized).toBe(true);
    });
  });

  describe('getSpec', () => {
    it('should return spec', () => {
      expect(plugin.getSpec()).toBe(mockSpec);
    });
  });

  describe('register', () => {
    it('should initialize if not initialized', async () => {
      const mockRegistryManager: IPluginRegistryManager = {
        register: vi.fn(),
      };
      await plugin.register(mockRegistryManager);
      // Create a plugin instance to check initialized state
      const registeredPlugin = new (class extends Plugin {
          constructor() {
            super(mockSpec);
          }
          /**
           *
           */
          async registerAndCheck() {
            await this.register(mockRegistryManager);

            return (this as any).initialised;
          }
        })(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        isInitialized = await registeredPlugin.registerAndCheck();
      expect(isInitialized).toBe(true);
    });
  });

  describe('execute', () => {
    it('should initialize if not initialized and return default result', async () => {
      const context = { operation: 'test' },
        result = await plugin.execute(context);
      expect(result).toEqual({
        success: true,
        plugin: mockSpec.id,
        timestamp: expect.any(String),
        output: {},
      });

      expect((plugin as any).initialised).toBe(true);
    });
  });
});
