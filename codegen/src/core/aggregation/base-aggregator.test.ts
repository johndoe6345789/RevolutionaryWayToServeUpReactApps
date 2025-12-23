/**
 * BaseAggregator Test Suite
 * Tests for the BaseAggregator class
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { BaseAggregator } from './base-aggregator';
import type { ISpec } from './interfaces/index';

describe('BaseAggregator', () => {
  let aggregator: BaseAggregator, mockSpec: ISpec;

  beforeEach(() => {
    mockSpec = {
      uuid: 'test-uuid-456',
      id: 'test-aggregator',
      type: 'aggregator',
      search: {
        title: 'Test BaseAggregator',
        summary: 'Test aggregator for unit testing',
        keywords: ['test', 'aggregator'],
        domain: 'test',
        capabilities: ['aggregation', 'lifecycle'],
      },
    };

    // Create a concrete implementation for testing
    /**
     *
     */
    class TestAggregator extends BaseAggregator {
      constructor(spec: ISpec) {
        super(spec);
      }
    }

    aggregator = new TestAggregator(mockSpec);
  });

  describe('constructor', () => {
    it('should initialize with valid spec', () => {
      expect(aggregator).toBeDefined();
      expect(aggregator.uuid).toBe(mockSpec.uuid);
      expect(aggregator.id).toBe(mockSpec.id);
      expect(aggregator.getLifecycleState()).toBe('uninitialized');
    });
  });

  describe('initialise', () => {
    it('should initialize and update lifecycle state', async () => {
      expect(aggregator.getLifecycleState()).toBe('uninitialized');
      const result = await aggregator.initialise();
      expect(result).toBe(aggregator);
      expect(aggregator.getLifecycleState()).toBe('ready');
    });
  });

  describe('execute', () => {
    beforeEach(async () => {
      await aggregator.initialise();
    });

    it('should execute and update lifecycle state', async () => {
      const input = { operation: 'test' };
      expect(aggregator.getLifecycleState()).toBe('ready');

      const result = await aggregator.execute(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(aggregator.getLifecycleState()).toBe('ready');
    });
  });

  describe('shutdown', () => {
    it('should shutdown and update lifecycle state', async () => {
      await aggregator.initialise();
      expect(aggregator.getLifecycleState()).toBe('ready');

      await aggregator.shutdown();
      expect(aggregator.getLifecycleState()).toBe('shutdown');
    });
  });

  describe('getChild', () => {
    it('should return null for non-existent child', () => {
      expect(aggregator.getChild('nonexistent')).toBeNull();
    });
  });

  describe('drillDown', () => {
    it('should return self for empty path', () => {
      expect(aggregator.drillDown([])).toBe(aggregator);
    });

    it('should return null for non-existent path', () => {
      expect(aggregator.drillDown(['nonexistent'])).toBeNull();
    });
  });

  describe('listChildren', () => {
    it('should return empty array initially', () => {
      expect(aggregator.listChildren()).toEqual([]);
    });
  });

  describe('getLifecycleState', () => {
    it('should return current lifecycle state', () => {
      expect(aggregator.getLifecycleState()).toBe('uninitialized');
    });
  });
});
