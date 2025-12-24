/**
 * Rust Generator Tests - validates code generation functionality
 * AGENTS.md compliant: comprehensive test coverage, lifecycle testing
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { RustGenerator } from '../src/rust-generator';
import specData from '../spec.json';

describe('RustGenerator', () => {
  let generator: RustGenerator;

  beforeEach(() => {
    generator = new RustGenerator(specData);
    generator.initialise();
    generator.validate();
  });

  it('should initialize correctly', () => {
    expect(generator.language).toBe('rust');
    expect(generator.extensions).toContain('.rs');
    expect(generator.supportedTemplates).toContain('struct');
  });

  it('should support struct template', () => {
    expect(generator.supportsTemplate('struct')).toBe(true);
  });

  it('should generate struct code', async () => {
    const context = {
      templateId: 'struct',
      variables: {
        name: 'User',
        fields: 'pub name: String,\npub age: u32,',
        defaults: 'name: String::new(),\nage: 0,',
      },
    };

    const result = await generator.generate(context);
    expect(result.content).toContain('#[derive(Debug, Clone)]');
    expect(result.content).toContain('pub struct User');
    expect(result.content).toContain('impl Default for User');
    expect(result.extension).toBe('.rs');
  });

  it('should generate function code', async () => {
    const context = {
      templateId: 'function',
      variables: {
        name: 'calculate_sum',
        params: 'a: i32, b: i32',
        return_type: 'i32',
        body: 'a + b',
      },
    };

    const result = await generator.generate(context);
    expect(result.content).toContain('pub fn calculate_sum(a: i32, b: i32) -> i32');
    expect(result.content).toContain('a + b');
  });

  it('should reject unsupported template', () => {
    expect(generator.supportsTemplate('unsupported')).toBe(false);
  });

  it('should execute lifecycle methods', () => {
    expect(() => {
      generator.reset();
    }).not.toThrow();
    expect(generator.status()).toBeDefined();
    expect(generator.debug()).toBeDefined();
  });
});
