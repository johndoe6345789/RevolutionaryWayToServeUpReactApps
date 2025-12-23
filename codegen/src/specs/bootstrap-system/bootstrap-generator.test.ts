import { describe, it, expect, beforeEach } from 'vitest';
import { BootstrapGenerator } from './generator';

describe('BootstrapGenerator', () => {
  let generator: BootstrapGenerator;

  beforeEach(() => {
    /**
     *
     */
    class TestBootstrapGenerator extends BootstrapGenerator {
      constructor() {
        super({
          uuid: 'test-uuid-bootstrap',
          id: 'bootstrap-generator',
          type: 'generator',
          search: {
            title: 'Bootstrap Generator',
            summary: 'Generates bootstrap system files',
            keywords: ['bootstrap', 'generator', 'system'],
            domain: 'codegen',
            capabilities: ['generation', 'bootstrap'],
          },
        });
      }
    }
    generator = new TestBootstrapGenerator();
  });

  it('should initialize', () => {
    expect(generator).toBeDefined();
  });
});
