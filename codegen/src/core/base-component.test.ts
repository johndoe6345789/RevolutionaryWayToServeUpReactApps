import { describe, it, expect, beforeEach } from 'vitest';
import { BaseComponent } from './base-component';

// Create a concrete implementation for testing
class TestComponent extends BaseComponent {
  // Concrete implementation for testing
}

describe('BaseComponent', () => {
  let mockSpec: any;
  let component: TestComponent;

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

    it('should throw error for invalid UUID', async () => {
      const invalidSpec = { ...mockSpec, uuid: 'invalid-uuid' };
      const invalidComponent = new TestComponent(invalidSpec);

      await expect(invalidComponent.initialise()).rejects.toThrow('Invalid UUID: invalid-uuid');
    });

    it('should throw error for missing id', async () => {
      const invalidSpec = { ...mockSpec, id: '' };
      const invalidComponent = new TestComponent(invalidSpec);

      await expect(invalidComponent.initialise()).rejects.toThrow(
        'Missing required fields: id, search'
      );
    });

    it('should throw error for missing search', async () => {
      const invalidSpec = { ...mockSpec, search: undefined };
      const invalidComponent = new TestComponent(invalidSpec);

      await expect(invalidComponent.initialise()).rejects.toThrow(
        'Missing required fields: id, search'
      );
    });
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
    it('should return true for valid objects', () => {
      expect(component.validate({})).toBe(true);
      expect(component.validate({ key: 'value' })).toBe(true);
      expect(component.validate([])).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(component.validate(null)).toBe(false);
      expect(component.validate(undefined)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(component.validate('string')).toBe(false);
      expect(component.validate(42)).toBe(false);
      expect(component.validate(true)).toBe(false);
    });
  });
});
