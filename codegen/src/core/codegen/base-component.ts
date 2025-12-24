import type { IComponent, ISpec, IStandardLifecycle } from '../interfaces/index';
import { LifecycleStatus } from '../interfaces/index';

/**
 * BaseComponent - AGENTS.md compliant base class implementing IStandardLifecycle and IComponent
 */
export abstract class BaseComponent implements IComponent, IStandardLifecycle {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: ISpec['search'];
  public readonly spec: ISpec;
  protected currentStatus: LifecycleStatus = LifecycleStatus.UNINITIALIZED;

  constructor(spec: ISpec) {
    this.uuid = spec.uuid;
    this.id = spec.id;
    this.search = spec.search;
    this.spec = spec;
  }

  /**
   *
   */
  public async initialise(): Promise<this> {
    this.validateSpec();
    this.currentStatus = LifecycleStatus.READY;
    return this;
  }

  /**
   *
   * @param input
   */
  public validate(input: unknown): boolean {
    const isObjectOrArray = typeof input === 'object' && input !== null;
    return isObjectOrArray;
  }

  /**
   *
   * @param _context
   */
  public async execute(_context: Record<string, unknown>): Promise<unknown> {
    this.currentStatus = LifecycleStatus.EXECUTING;
    return {
      success: true,
      component: this.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   *
   */
  public cleanup(): void {
    this.currentStatus = LifecycleStatus.DESTROYED;
  }

  /**
   *
   */
  public debug(): Record<string, unknown> {
    return {
      uuid: this.uuid,
      id: this.id,
      status: this.currentStatus,
      spec: this.spec,
    };
  }

  /**
   *
   */
  public reset(): void {
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   *
   */
  public status(): LifecycleStatus {
    return this.currentStatus;
  }

  /**
   *
   */
  private validateSpec(): void {
    if (!this.isValidUUID(this.uuid)) {
      throw new Error(`Invalid UUID: ${this.uuid}`);
    }
    if (!this.id || !this.search) {
      throw new Error('Missing required fields: id, search');
    }
  }

  /**
   *
   * @param uuid
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const hyphenCount = typeof uuid === 'string' ? (uuid.match(/-/g)?.length ?? 0) : 0;
    return typeof uuid === 'string' && (uuidRegex.test(uuid) || hyphenCount >= 2);
  }
}
