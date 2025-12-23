/**
 * CodegenEntrypoint Test Suite
 * Tests for the CodegenEntrypoint class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodegenEntrypoint } from './codegen-entrypoint';
import type { IAggregator } from '../core/interfaces/index';

describe('CodegenEntrypoint', () => {
  let entrypoint: CodegenEntrypoint;
  let mockAggregator: IAggregator;

  beforeEach(() => {
    mockAggregator = {
      drillDown: vi.fn(),
      listChildren: vi.fn(),
      execute: vi.fn(),
      getChild: vi.fn(),
      getLifecycleState: vi.fn(),
      initialise: vi.fn(),
      shutdown: vi.fn(),
      uuid: 'test-uuid',
      id: 'test-aggregator',
      spec: { uuid: 'test-uuid', id: 'test-aggregator', type: 'aggregator' },
      search: {
        title: 'Test Aggregator',
        summary: 'Test aggregator for unit tests',
        keywords: ['test'],
        domain: 'test',
        capabilities: ['test'],
      },
      validate: vi.fn(),
    } as unknown as IAggregator;

    entrypoint = new CodegenEntrypoint(mockAggregator);
  });

  describe('constructor', () => {
    it('should initialize successfully', () => {
      expect(entrypoint).toBeDefined();
    });
  });

  describe('basic functionality', () => {
    it('should have expected properties', () => {
      expect(entrypoint).toHaveProperty('uuid');
      expect(entrypoint).toHaveProperty('id');
      expect(entrypoint).toHaveProperty('search');
    });
  });
});
