/**
 * BaseComponent - Foundation for all AGENTS.md compliant components
 * Strict OO constraints: 1 constructor param, ≤3 public methods, ≤10 lines per function
 * TypeScript strict typing with no 'any' types
 */

import { IComponent, ISearchMetadata, ISpec } from './interfaces/index';

export abstract class BaseComponent implements IComponent {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: ISearchMetadata;
  public readonly spec: ISpec;

  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param spec - Component specification with uuid, id, search metadata
   */
  constructor(spec: ISpec) {
    this.uuid = spec.uuid;
    this.id = spec.id;
    this.search = spec.search;
    this.spec = spec;
  }

  /**
   * Initialise component (lifecycle method, ≤10 lines)
   * @returns Promise<BaseComponent> Initialised component
   */
  public async initialise(): Promise<IComponent> {
    // Validate UUID format
    if (!this.isValidUUID(this.uuid)) {
      throw new Error(`Invalid UUID: ${this.uuid}`);
    }
    // Validate required fields
    if (!this.id || !this.search) {
      throw new Error('Missing required fields: id, search');
    }
    return this;
  }

  /**
   * Execute component logic (core method, ≤10 lines)
   * @param context - Execution context
   * @returns Execution result
   */
  public async execute(context: Record<string, unknown>): Promise<unknown> {
    return {
      success: true,
      component: this.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate input (optional method, keeps ≤3 total public methods)
   * @param input - Input to validate
   * @returns Validation result
   */
  public validate(input: unknown): boolean {
    return input !== null && input !== undefined && typeof input === 'object';
  }

  /**
   * Validate UUID format (private helper, ≤10 lines)
   * @param uuid - UUID to validate
   * @returns True if valid UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }
}
