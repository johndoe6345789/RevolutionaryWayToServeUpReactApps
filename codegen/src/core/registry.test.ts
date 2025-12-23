import { describe, it, expect, beforeEach } from 'vitest';
import { Registry } from './registry';

// Create a concrete implementation for testing
/**
 *
 */
class TestRegistry extends Registry {
  constructor() {
    super({
      uuid: '12345678-1234-4123-8123-123456789012',
      id: 'test-registry',
      type: 'registry',
      search: {
        title: 'Test Registry',
        summary: 'A test registry implementation',
        keywords: ['test', 'registry'],
        domain: 'core',
        capabilities: ['storage', 'lookup'],
      },
      componentType: 'test',
    });
  }
}

// Mock component for testing
/**
 *
 */
class MockComponent {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: any;

  constructor(uuid: string, id: string, search: any = {}) {
    this.uuid = uuid;
    this.id = id;
    this.search = search;
  }
}

describe('Registry', () => {
  let registry: TestRegistry;
  let mockComponent1: MockComponent;
  let mockComponent2: MockComponent;
  let mockComponent3: MockComponent;

  beforeEach(() => {
    registry = new TestRegistry();
    mockComponent1 = new MockComponent('11111111-1111-1111-1111-111111111111', 'comp1', {
      title: 'Component 1',
      summary: 'First test component',
      keywords: ['test', 'component'],
      domain: 'testing',
      capabilities: ['testing'],
    });
    mockComponent2 = new MockComponent('22222222-2222-2222-2222-222222222222', 'comp2', {
      title: 'Component 2',
      summary: 'Second test component',
      keywords: ['test', 'component'],
      domain: 'testing',
      capabilities: ['testing'],
    });
    mockComponent3 = new MockComponent('33333333-3333-3333-3333-333333333333', 'comp3', {
      title: 'Component 3',
      summary: 'Third test component',
      keywords: ['test', 'component'],
      domain: 'testing',
      capabilities: ['testing'],
    });

    // Use reflection to add components to registry (since _register is protected)
    (registry as any).components.set('comp1', mockComponent1);
    (registry as any).components.set('comp2', mockComponent2);
    (registry as any).components.set('comp3', mockComponent3);
  });

  describe('listIds', () => {
    it('should return IDs for populated registry', () => {
      const result = registry.listIds();
      expect(result).toEqual(['comp1', 'comp2', 'comp3']);
      expect(result).toHaveLength(3);
    });

    it('should return empty array for cleared registry', () => {
      const emptyRegistry = new TestRegistry();
      const result = emptyRegistry.listIds();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return new array instance each time', () => {
      const result1 = registry.listIds();
      const result2 = registry.listIds();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    it('should maintain insertion order', () => {
      const result = registry.listIds();
      expect(result).toEqual(['comp1', 'comp2', 'comp3']);
    });
  });

  describe('get', () => {
    it('should return existing components by ID', () => {
      expect(registry.get('comp1')).toBe(mockComponent1);
      expect(registry.get('comp2')).toBe(mockComponent2);
      expect(registry.get('comp3')).toBe(mockComponent3);
    });

    it.each([
      ['non-existent ID', 'nonexistent'],
      ['empty string ID', ''],
    ])('should return null for %s', (description, id) => {
      const result = registry.get(id);
      expect(result).toBeNull();
    });

    it('should return null for null and undefined IDs', () => {
      expect(registry.get(null as any)).toBeNull();
      expect(registry.get(undefined as any)).toBeNull();
    });

    describe('UUID lookup', () => {
      it('should find existing components by UUID', () => {
        expect(registry.get('11111111-1111-1111-1111-111111111111')).toBe(mockComponent1);
        expect(registry.get('22222222-2222-2222-2222-222222222222')).toBe(mockComponent2);
        expect(registry.get('33333333-3333-3333-3333-333333333333')).toBe(mockComponent3);
      });

      it.each([
        ['non-existent UUID', '99999999-9999-9999-9999-999999999999'],
        ['invalid UUID format', 'invalid-uuid'],
        ['empty UUID', ''],
      ])('should return null for %s', (description, uuid) => {
        const result = registry.get(uuid);
        expect(result).toBeNull();
      });

      it('should prioritize ID lookup over UUID lookup', () => {
        // Add a component with ID that matches another component's UUID
        const conflictingComponent = new MockComponent(
          '44444444-4444-4444-4444-444444444444',
          '22222222-2222-2222-2222-222222222222'
        );
        (registry as any).components.set(
          '22222222-2222-2222-2222-222222222222',
          conflictingComponent
        );

        // Should return component with matching ID, not UUID
        const result = registry.get('22222222-2222-2222-2222-222222222222');
        expect(result).toBe(conflictingComponent);
        expect(result).not.toBe(mockComponent2);
      });
    });

    it.each([
      ['string ID', 'comp1'],
      ['numeric ID as string', '123'],
      ['ID with special chars', 'comp_1-test.value'],
    ])('should handle %s correctly', (description, id) => {
      const component = new MockComponent('test-uuid', id);
      (registry as any).components.set(id, component);

      const result = registry.get(id);
      expect(result).toBe(component);
    });
  });

  describe('describe', () => {
    it.each([
      [
        'existing component by ID',
        'comp1',
        {
          title: 'Component 1',
          summary: 'First test component',
          keywords: ['test', 'component'],
          domain: 'testing',
          capabilities: ['testing'],
        },
      ],
      [
        'existing component by UUID',
        '11111111-1111-1111-1111-111111111111',
        {
          title: 'Component 1',
          summary: 'First test component',
          keywords: ['test', 'component'],
          domain: 'testing',
          capabilities: ['testing'],
        },
      ],
      ['non-existent component', 'nonexistent', null],
      ['null ID', null as any, null],
      ['undefined ID', undefined as any, null],
      ['empty string ID', '', null],
    ])('should return search metadata for %s', (description, idOrUuid, expectedSearch) => {
      const result = registry.describe(idOrUuid);
      expect(result).toEqual(expectedSearch);
    });

    it('should return correct search metadata', () => {
      const result = registry.describe('comp2');
      expect(result).toEqual({
        title: 'Component 2',
        summary: 'Second test component',
        keywords: ['test', 'component'],
        domain: 'testing',
        capabilities: ['testing'],
      });
    });

    it('should handle components with complex search metadata', () => {
      const complexComponent = new MockComponent('complex-uuid', 'complex-comp', {
        title: 'Complex Component',
        summary: 'A complex component',
        keywords: ['complex', 'advanced'],
        tags: ['tag1', 'tag2'],
        domain: 'testing',
      });
      (registry as any).components.set('complex-comp', complexComponent);

      const result = registry.describe('complex-comp');
      expect(result).toEqual({
        title: 'Complex Component',
        summary: 'A complex component',
        keywords: ['complex', 'advanced'],
        tags: ['tag1', 'tag2'],
        domain: 'testing',
      });
    });
  });

  describe('component validation (_validateComponent)', () => {
    it.each([
      ['null component', null, false],
      ['undefined component', undefined, false],
      ['string component', 'not a component', false],
      ['number component', 42, false],
      ['boolean component', true, false],
      ['array component', [], false],
      ['empty object', {}, false],
    ])('should validate %s correctly', (description, component, expectedValid) => {
      const result = (registry as any)._validateComponent(component);
      expect(result).toBe(expectedValid);
    });

    it('should validate proper component objects', () => {
      // Test with plain objects that match the expected interface
      const validComponent = {
        uuid: '12345678-1234-4123-8123-123456789012',
        id: 'test-id',
        search: { title: 'Test' },
      };
      const result = (registry as any)._validateComponent(validComponent);
      expect(result).toBe(true);
    });

    it.each([
      ['missing uuid', { id: 'test', search: {} }, false],
      ['missing id', { uuid: 'test-uuid', search: {} }, false],
      ['missing search', { uuid: 'test-uuid', id: 'test' }, false],
      ['null uuid', { uuid: null, id: 'test', search: {} }, false],
      ['undefined id', { uuid: 'test-uuid', id: undefined, search: {} }, false],
      ['empty search', { uuid: 'test-uuid', id: 'test', search: null }, false],
    ])('should reject component with %s', (description, component, expectedValid) => {
      const result = (registry as any)._validateComponent(component);
      expect(result).toBe(expectedValid);
    });

    describe('UUID validation in components', () => {
      it.each([
        ['valid UUID v4', '12345678-1234-4123-8123-123456789012', true],
        ['invalid UUID - wrong format', '12345678-1234-4123-8123-12345678901', false],
        ['invalid UUID - no hyphens', '12345678123441238123123456789012', false],
        ['invalid UUID - wrong version', '12345678-1234-3123-8123-123456789012', false],
        ['invalid UUID - non-hex chars', 'gggggggg-gggg-gggg-gggg-gggggggggggg', false],
        ['null UUID', null, false],
        ['undefined UUID', undefined, false],
        ['empty string UUID', '', false],
        ['number UUID', 123456789, false],
      ])('should validate UUID in component: %s', (description, uuid, expectedValid) => {
        const component = { uuid, id: 'test-id', search: { title: 'Test' } };
        const result = (registry as any)._validateComponent(component);
        expect(result).toBe(expectedValid);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle full registry lifecycle', () => {
      // Start with populated registry
      expect(registry.listIds()).toEqual(['comp1', 'comp2', 'comp3']);
      expect(registry.get('comp1')).toBe(mockComponent1);
      expect(registry.describe('comp1')).toEqual({
        title: 'Component 1',
        summary: 'First test component',
        keywords: ['test', 'component'],
        domain: 'testing',
        capabilities: ['testing'],
      });

      // Simulate adding new component
      const newComponent = new MockComponent('new-uuid', 'new-comp', { title: 'New Component' });
      (registry as any).components.set('new-comp', newComponent);

      expect(registry.listIds()).toContain('new-comp');
      expect(registry.get('new-comp')).toBe(newComponent);
      expect(registry.describe('new-uuid')).toBe(newComponent.search);

      // Simulate removing component
      (registry as any).components.delete('comp2');
      expect(registry.listIds()).not.toContain('comp2');
      expect(registry.get('comp2')).toBeNull();
      expect(registry.describe('22222222-2222-2222-2222-222222222222')).toBeNull();
    });

    it.each([
      ['ID lookup', 'comp1', 'ID'],
      ['UUID lookup', '11111111-1111-1111-1111-111111111111', 'UUID'],
    ])('should support both ID and UUID lookup for %s', (description, identifier, lookupType) => {
      const component = registry.get(identifier);
      expect(component).toBe(mockComponent1);
      expect(component?.id).toBe('comp1');
      expect(component?.uuid).toBe('11111111-1111-1111-1111-111111111111');
    });

    it('should maintain component immutability', () => {
      const component = registry.get('comp1');
      expect(component).toBe(mockComponent1);

      // Verify components are not modifiable through registry
      const list1 = registry.listIds();
      const list2 = registry.listIds();
      expect(list1).not.toBe(list2); // Different array instances
      expect(list1).toEqual(list2); // Same content
    });

    it('should handle edge cases gracefully', () => {
      // Test with various invalid inputs
      expect(registry.get('')).toBeNull();
      expect(registry.get(null as any)).toBeNull();
      expect(registry.get(undefined as any)).toBeNull();
      expect(registry.describe('')).toBeNull();
      expect(registry.describe(null as any)).toBeNull();
      expect(registry.describe(undefined as any)).toBeNull();

      // Registry should remain functional
      expect(registry.listIds()).toEqual(['comp1', 'comp2', 'comp3']);
      expect(registry.get('comp1')).toBe(mockComponent1);
    });
  });
});
