/**
 * Registry - AGENTS.md compliant component registry
 * Strict OO constraints: ≤3 public methods, immutable after construction
 * TypeScript strict typing with no 'any' types
 */

import { BaseComponent } from './base-component';
import type { IRegistry, IComponent } from './interfaces/index';
import type { ISearchMetadata } from './interfaces/isearch-metadata';
import type { ISpec } from './interfaces/ispec';

/**
 *
 */
export abstract class Registry extends BaseComponent implements IRegistry {
  protected components: Map<string, IComponent>;
  public readonly componentType: string;

  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param spec - Registry specification
   */
  constructor(spec: ISpec) {
    super(spec);
    this.components = new Map();
    this.componentType = spec.componentType || 'component';
  }

  /**
   * List all component IDs (≤3 public methods, ≤10 lines)
   * @returns Array of component IDs
   */
  public listIds(): readonly string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get component by ID or UUID (≤3 public methods, ≤10 lines)
   * @param idOrUuid - Component ID or UUID
   * @returns Component or null if not found
   */
  public get(idOrUuid: string): IComponent | null {
    // Try direct ID lookup first
    if (this.components.has(idOrUuid)) {
      return this.components.get(idOrUuid) || null;
    }
    // Fallback to UUID lookup
    for (const component of this.components.values()) {
      if (component.uuid === idOrUuid) {
        return component;
      }
    }
    return null;
  }

  /**
   * Register component (protected method for subclasses)
   * @param id - Component ID
   * @param component - Component to register
   */
  protected _register(id: string, component: IComponent): void {
    this.components.set(id, component);
  }

  /**
   * Validate component before registration (≤10 lines)
   * @param component - Component to validate
   * @returns Is valid
   */
  protected _validateComponent(component: unknown): boolean {
    return (
      component !== null &&
      component !== undefined &&
      typeof component === 'object' &&
      'uuid' in component &&
      'id' in component &&
      'search' in component &&
      this.isValidUUID((component as any).uuid)
    );
  }

  /**
   * Describe component for search/discovery
   * @param idOrUuid - Component ID or UUID
   * @returns Search metadata or null
   */
  public describe(idOrUuid: string): ISearchMetadata | null {
    const component = this.get(idOrUuid);
    return component ? component.search : null;
  }

  /**
   * Validate UUID format (private helper)
   * @param uuid - UUID to validate
   * @returns True if valid UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }
}
