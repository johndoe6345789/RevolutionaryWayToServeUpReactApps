/**
 * Aggregate Test Suite
 * Tests for the Aggregate base class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Aggregate } from './aggregate';
import type { ISpec } from './interfaces/ispec';

describe('Aggregate', () => {
  let mockSpec: ISpec;
  let aggregate: Aggregate;

  beforeEach(() => {
    mockSpec = {
      uuid: 'test-uuid-123',
      id: 'test-aggregate',
      type: 'aggregate',
      aggregateType: 'test',
      search: {
        title: 'Test Aggregate',
        summary: 'Test aggregate for unit testing',
        keywords: ['test', 'aggregate'],
        domain: 'test',
        capabilities: ['aggregation'],
      },
    };

    // Create a concrete implementation for testing
    /**
     *
     */
    class TestAggregate extends Aggregate {
      constructor(spec: ISpec) {
        super(spec);
      }
    }

    aggregate = new TestAggregate(mockSpec);
  });

  describe('constructor', () => {
    it('should initialize with valid spec', () => {
      expect(aggregate).toBeDefined();
      expect(aggregate.uuid).toBe(mockSpec.uuid);
      expect(aggregate.id).toBe(mockSpec.id);
    });

    it('should throw error with invalid spec', () => {
      const invalidSpec = { ...mockSpec, uuid: '' };
      /**
       *
       */
      class TestAggregate extends Aggregate {
        constructor(spec: ISpec) {
          super(spec);
        }
        /**
         *
         * @param _input
         * @returns boolean indicating if input is valid
         */
        protected _validateInput(_input: unknown): boolean {
          return true;
        }
        /**
         *
         * @param _items
         * @returns Promise resolving to processed items
         */
        protected _processItems(_items: unknown[]): Promise<unknown[]> {
          return Promise.resolve([]);
        }
        /**
         *
         * @param _results
         * @returns merged results
         */
        protected _mergeResults(_results: unknown[]): unknown {
          return null;
        }
      }
      expect(() => new TestAggregate(invalidSpec as ISpec)).toThrow();
    });
  });

  describe('initialise', () => {
    it('should initialize successfully', async () => {
      const result = await aggregate.initialise();
      expect(result).toBe(aggregate);
    });
  });

  describe('execute', () => {
    it('should execute with valid input', async () => {
      const input = { items: [1, 2, 3] };
      const result = await aggregate.execute(input);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle empty input', async () => {
      const input = { items: [] };
      const result = await aggregate.execute(input);
      expect(result).toBeDefined();
    });

    it('should execute with string input', async () => {
      const input = { operation: 'test' };
      const result = await aggregate.execute(input);
      expect(result).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate object input', () => {
      expect(aggregate.validate({ test: 'data' })).toBe(true);
    });

    it('should reject null input', () => {
      expect(aggregate.validate(null)).toBe(false);
    });

    it('should reject undefined input', () => {
      expect(aggregate.validate(undefined)).toBe(false);
    });
  });
});
