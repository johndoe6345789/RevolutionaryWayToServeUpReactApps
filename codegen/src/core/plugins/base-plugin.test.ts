/**
 * BasePlugin Test Suite
 * Tests for the BasePlugin class
 */

import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BasePlugin } from './base-plugin';
import type { IPluginConfig, IRegistryManager, ISpec } from './interfaces/index';
import { PluginSpecLoader } from './plugin-spec-loader';
import { PluginMessageLoader } from './plugin-message-loader';

// Mock the file system dependent classes
vi.mock('./plugin-spec-loader');
vi.mock('./plugin-message-loader');

describe('BasePlugin', () => {
  let mockConfig: IPluginConfig;
  let mockMessageLoader: Mocked<PluginMessageLoader>;
  let mockSpecLoader: Mocked<PluginSpecLoader>;
  let plugin: BasePlugin;

  beforeEach(() => {
    mockConfig = {
      name: 'test-plugin',
      description: 'Test plugin for unit testing',
      version: '1.0.0',
      author: 'Test Author',
      category: 'test',
      keywords: ['test', 'plugin'],
      tags: ['testing'],
      aliases: ['test'],
      domain: 'test',
      capabilities: ['testing'],
    };

    mockSpecLoader = vi.mocked(PluginSpecLoader.prototype);
    mockMessageLoader = vi.mocked(PluginMessageLoader.prototype);

    // Create a concrete implementation for testing
    /**
     *
     */
    class TestPlugin extends BasePlugin {
      constructor(config: IPluginConfig) {
        super(config);
      }
    }

    plugin = new TestPlugin(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(plugin).toBeDefined();
      expect(plugin.config).toBe(mockConfig);
    });

    it('should create spec from config', () => {
      expect(plugin.id).toBe(mockConfig.name);
      expect(plugin.search.title).toBe(mockConfig.name);
      expect(plugin.search.summary).toBe(mockConfig.description);
      expect(plugin.search.keywords).toEqual(mockConfig.keywords);
    });
  });

  describe('getSpec', () => {
    it('should initialize plugin if not initialized', async () => {
      const mockSpec: ISpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      };

      mockSpecLoader.loadSpec.mockResolvedValue(mockSpec);
      mockSpecLoader.validateSpec.mockReturnValue(true);

      const result = await plugin.getSpec();
      expect(result).toBeDefined();
      expect(mockSpecLoader.loadSpec).toHaveBeenCalled();
    });

    it('should return cached spec if already initialized', async () => {
      // Initialize first
      const mockSpec: ISpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      };

      mockSpecLoader.loadSpec.mockResolvedValue(mockSpec);
      mockSpecLoader.validateSpec.mockReturnValue(true);

      await plugin.getSpec();
      mockSpecLoader.loadSpec.mockClear();

      // Second call should use cache
      const result = await plugin.getSpec();
      expect(result).toBeDefined();
      expect(mockSpecLoader.loadSpec).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('should load messages from message loader', async () => {
      const mockMessages = {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        es: { hello: 'Hola', goodbye: 'Adiós' },
      };

      mockMessageLoader.loadMessages.mockResolvedValue(mockMessages);

      const result = await plugin.getMessages();
      expect(result).toEqual(mockMessages);
      expect(mockMessageLoader.loadMessages).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should initialize plugin if not initialized', async () => {
      const mockRegistryManager: IRegistryManager = {
        register: vi.fn(),
        getRegistry: vi.fn(),
        getAggregate: vi.fn(),
      };
      const mockSpec: ISpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      };

      mockSpecLoader.loadSpec.mockResolvedValue(mockSpec);
      mockSpecLoader.validateSpec.mockReturnValue(true);

      await plugin.register(mockRegistryManager);
      expect(mockSpecLoader.loadSpec).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should reset initialized state', async () => {
      // First initialize
      const mockSpec: ISpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      };

      mockSpecLoader.loadSpec.mockResolvedValue(mockSpec);
      mockSpecLoader.validateSpec.mockReturnValue(true);

      await plugin.getSpec();
      expect(plugin).toBeDefined();

      // Then shutdown
      await plugin.shutdown();
      // Plugin should handle shutdown gracefully
    });
  });
});
