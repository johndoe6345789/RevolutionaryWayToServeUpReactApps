import { describe, it, expect, beforeEach } from 'vitest';
import { PluginAggregator } from './plugin-aggregator';

describe('PluginAggregator', () => {
  let aggregator: PluginAggregator;

  beforeEach(() => {
    /**
     *
     */
    class TestPluginAggregator extends PluginAggregator {
      constructor() {
        super({
          uuid: 'test-uuid-789',
          id: 'test-plugin-aggregator',
          type: 'aggregator',
          search: {
            title: 'Test PluginAggregator',
            summary: 'Test plugin aggregator',
            keywords: ['test', 'plugin'],
            domain: 'test',
            capabilities: ['plugin-aggregation'],
          },
        });
      }
    }
    aggregator = new TestPluginAggregator();
  });

  it('should initialize', () => {
    expect(aggregator).toBeDefined();
  });
});
