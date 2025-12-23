/**
 * BaseCodegen Test Suite
 * Tests for the BaseCodegen class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseCodegen } from './base-codegen';
import type { IBaseCodegenOptions } from './interfaces/index';

describe('BaseCodegen', () => {
  let codegen: BaseCodegen;
  let mockOptions: IBaseCodegenOptions;

  beforeEach(() => {
    mockOptions = {
      outputDir: './test-output',
      strictMode: false,
      verbose: false,
      enableCache: false,
    };

    // Create a concrete implementation for testing
    /**
     *
     */
    class TestCodegen extends BaseCodegen {
      constructor(options: IBaseCodegenOptions = {}) {
        super(options);
      }
    }

    codegen = new TestCodegen(mockOptions);
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultCodegen = new (class extends BaseCodegen {
        constructor() {
          super({});
        }
      })();
      expect(defaultCodegen).toBeDefined();
    });

    it('should initialize with custom options', () => {
      expect(codegen).toBeDefined();
      const status = codegen.getStatus();
      expect(status.options.outputDir).toBe('./test-output');
      expect(status.options.strictMode).toBe(false);
      expect(status.options.verbose).toBe(false);
      expect(status.options.enableCache).toBe(false);
    });

    it('should initialize registries as empty maps', () => {
      const status = codegen.getStatus();
      expect(status.registries.plugins).toBe(0);
      expect(status.registries.aggregates).toBe(0);
      expect(status.registries.specs).toBe(0);
    });

    it('should not be initialized initially', () => {
      const status = codegen.getStatus();
      expect(status.initialized).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return correct initial status', () => {
      const status = codegen.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.plugins.discovered).toBe(0);
      expect(status.plugins.loaded).toBe(0);
      expect(status.registries.plugins).toBe(0);
      expect(status.registries.aggregates).toBe(0);
      expect(status.registries.specs).toBe(0);
      expect(status.options.outputDir).toBe('./test-output');
      expect(status.options.strictMode).toBe(false);
      expect(status.options.verbose).toBe(false);
      expect(status.options.enableCache).toBe(false);
    });
  });

  describe('register', () => {
    it('should register plugin components', () => {
      const mockComponent = { id: 'test-plugin' };
      codegen.register('plugin', 'test-plugin', mockComponent);

      expect(codegen.get('plugin', 'test-plugin')).toBe(mockComponent);
    });

    it('should register aggregate components', () => {
      const mockComponent = { id: 'test-aggregate' };
      codegen.register('TestAggregate', 'test-component', mockComponent);

      expect(codegen.get('TestAggregate', 'test-component')).toBe(mockComponent);
    });
  });

  describe('get', () => {
    it('should return registered component', () => {
      const mockComponent = { id: 'test-component' };
      codegen.register('plugin', 'test-component', mockComponent);

      expect(codegen.get('plugin', 'test-component')).toBe(mockComponent);
    });

    it('should return null for non-existent component', () => {
      expect(codegen.get('plugin', 'nonexistent')).toBeNull();
    });
  });

  describe('list', () => {
    it('should list registered components', () => {
      const component1 = { id: 'component1' };
      const component2 = { id: 'component2' };
      codegen.register('plugin', 'component1', component1);
      codegen.register('plugin', 'component2', component2);

      const list = codegen.list('plugin');
      expect(list).toContain('component1');
      expect(list).toContain('component2');
    });

    it('should return empty array for empty registry', () => {
      expect(codegen.list('plugin')).toEqual([]);
    });
  });

  describe('drillDown', () => {
    it('should return null when no root aggregate exists', () => {
      expect(codegen.drillDown(['test'])).toBeNull();
    });

    it('should return null for empty path', () => {
      expect(codegen.drillDown([])).toBeNull();
    });
  });

  describe('getRootAggregate', () => {
    it('should return undefined when no root aggregate is set', () => {
      expect(codegen.getRootAggregate()).toBeUndefined();
    });
  });

  describe('execute', () => {
    it('should throw error when not initialized', async () => {
      const context = { operation: 'test' };
      await expect(codegen.execute(context)).rejects.toThrow(
        'Codegen system not initialized. Call initialize() first.'
      );
    });
  });

  describe('initialize', () => {
    it('should initialize the system successfully', async () => {
      // Test that initialize can be called without throwing
      await expect(codegen.initialize()).resolves.toBeDefined();
    });
  });
});
