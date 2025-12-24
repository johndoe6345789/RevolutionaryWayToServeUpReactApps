import { beforeEach, describe, expect, it } from 'vitest';
import { BaseComponent } from './base-component';

// Create a concrete implementation for testing
/**
 *
 */
class TestComponent extends BaseComponent {
  // Concrete implementation for testing
}

describe('BaseComponent', () => {
  let component: TestComponent;
  let mockSpec: any;

  beforeEach(() => {
    mockSpec = {
      uuid: '12345678-1234-4123-8123-123456789012',
      id: 'test-component',
      search: {
        keywords: ['test', 'component'],
        category: 'test',
      },
    };
    component = new TestComponent(mockSpec);
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(component.uuid).toBe(mockSpec.uuid);
      expect(component.id).toBe(mockSpec.id);
      expect(component.search).toBe(mockSpec.search);
      expect(component.spec).toBe(mockSpec);
    });
  });

  describe('initialise', () => {
    it('should validate UUID format and required fields', async () => {
      const result = await component.initialise();
      expect(result).toBe(component);
    });

    it.each([
      ['invalid UUID', { ...mockSpec, uuid: 'invalid-uuid' }, 'Invalid UUID: invalid-uuid'],
      [
        'missing id',
        { uuid: '12345678-1234-4123-8123-123456789012', id: '', search: { keywords: ['test'] } },
        'Missing required fields: id, search',
      ],
      [
        'missing search',
        { uuid: '12345678-1234-4123-8123-123456789012', id: 'test-id', search: undefined },
        'Missing required fields: id, search',
      ],
    ])(
      'should throw error for %s',
      async (description: string, invalidSpec: any, expectedError: string) => {
        const invalidComponent = new TestComponent(invalidSpec);

        await expect(invalidComponent.initialise()).rejects.toThrow(expectedError);
      },
    );
  });

  describe('execute', () => {
    it('should return success result with component id and timestamp', async () => {
      const context = { test: 'data' };
      const result = await component.execute(context);

      expect(result).toEqual({
        success: true,
        component: 'test-component',
        timestamp: expect.any(String),
      });
    });
  });

  describe('validate', () => {
    it.each([
      ['empty object', {}, true],
      ['object with properties', { key: 'value' }, true],
      ['array', [], true],
    ])('should return %s for %s', (expected: string, input: any, result: boolean) => {
      expect(component.validate(input)).toBe(result);
    });

    it.each([
      ['null', null, false],
      ['undefined', undefined, false],
    ])('should return false for %s', (description: string, input: any, expected: boolean) => {
      expect(component.validate(input)).toBe(expected);
    });

    it.each([
      ['string', 'string', false],
      ['number', 42, false],
      ['boolean', true, false],
    ])('should return false for %s input', (description: string, input: any, expected: boolean) => {
      expect(component.validate(input)).toBe(expected);
    });
  });
});
