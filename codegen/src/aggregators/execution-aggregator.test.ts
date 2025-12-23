import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionAggregator } from './execution-aggregator';

describe('ExecutionAggregator', () => {
  let aggregator: ExecutionAggregator;

  beforeEach(() => {
    /**
     *
     */
    class TestExecutionAggregator extends ExecutionAggregator {
      constructor() {
        super({
          uuid: 'test-uuid-456',
          id: 'test-execution-aggregator',
          type: 'aggregator',
          search: {
            title: 'Test ExecutionAggregator',
            summary: 'Test execution aggregator',
            keywords: ['test', 'execution'],
            domain: 'test',
            capabilities: ['execution'],
          },
        });
      }
    }
    aggregator = new TestExecutionAggregator();
  });

  it('should initialize', () => {
    expect(aggregator).toBeDefined();
  });
});
