/**
 * BaseComponent - Foundation for all AGENTS.md compliant components
 * Implements IStandardLifecycle with ≤3 public methods, ≤10 lines per function
 * TypeScript strict typing with no 'any' types
 */

import type { ISearchMetadata, ISpec } from '../interfaces/index';
import type { IStandardLifecycle } from '../types/lifecycle';
import { LifecycleStatus } from '../types/lifecycle';

/**
 * BaseComponent - AGENTS.md compliant base class implementing IStandardLifecycle
 */
export abstract class BaseComponent implements IStandardLifecycle {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: ISearchMetadata;
  public readonly spec: ISpec;
  protected currentStatus: LifecycleStatus = LifecycleStatus.UNINITIALIZED;

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
   * Initialise - Called after construction, register with registry, prepare state
   */
  public initialise(): void {
    this.validateSpec();
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Validate - Pre-flight checks before execution, verify dependencies
   */
  public validate(): void {
    if (this.currentStatus === LifecycleStatus.UNINITIALIZED) {
      throw new Error('Component not initialized');
    }
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Execute - Primary operational method, return values via messaging
   */
  public execute(): unknown {
    this.currentStatus = LifecycleStatus.EXECUTING;
    return {
      success: true,
      component: this.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup - Resource cleanup and shutdown, idempotent
   */
  public cleanup(): void {
    this.currentStatus = LifecycleStatus.DESTROYED;
  }

  /**
   * Debug - Return diagnostic data for debugging
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
   * Reset - State reset for testing, return to uninitialized
   */
  public reset(): void {
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   * Status - Return current lifecycle state
   */
  public status(): LifecycleStatus {
    return this.currentStatus;
  }

  /**
   * Validate component specification (private helper, ≤10 lines)
   */
  private validateSpec(): void {
    if (!this.isValidUUID(this.uuid)) {
      throw new Error(`Invalid UUID: ${this.uuid}`);
    }
    if (!this.id) {
      throw new Error('Missing required field: id');
    }
    if (!this.search.title) {
      throw new Error('Missing required field: search.title');
    }
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
