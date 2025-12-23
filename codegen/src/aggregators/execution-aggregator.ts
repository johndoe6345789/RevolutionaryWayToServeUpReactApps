/**
 * ExecutionAggregator - Coordinates execution pipeline with lifecycle management
 * Manages code generation workflow and result aggregation
 * TypeScript strict typing with no 'any' types
 */

import type { IComponent } from '../core/interfaces/index';
import type { ISpec } from '../core/interfaces/ispec';
import type { IStandardLifecycle } from '../core/types/lifecycle';
import { LifecycleStatus } from '../core/types/lifecycle';

/**
 *
 */
interface ExecutionResults {
  success: boolean;
  generated: string[];
  errors: string[];
  warnings: string[];
  stats: {
    pluginsExecuted: number;
    specsProcessed: number;
    filesGenerated: number;
    [key: string]: number;
  };
}

/**
 * ExecutionAggregator - Coordinates execution pipeline with lifecycle management
 * Manages code generation workflow and result aggregation
 * TypeScript strict typing with no 'any' types
 */
export class ExecutionAggregator implements IStandardLifecycle {
  private readonly spec: ISpec;
  private readonly children: Map<string, IComponent>;
  private executionResults: ExecutionResults;
  private currentStatus: LifecycleStatus;

  /**
   * Create a new ExecutionAggregator
   * @param spec The specification for this aggregator
   */
  constructor(spec: ISpec) {
    this.spec = spec;
    this.children = new Map();
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
    this.executionResults = {
      success: false,
      generated: [],
      errors: [],
      warnings: [],
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0,
      },
    };
  }

  /**
   * Initialise - Register with registry and prepare runtime state
   */
  public async initialise(): Promise<void> {
    this.currentStatus = LifecycleStatus.INITIALIZING;
    // Initialize child components if any
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Validate - Pre-flight checks before execution
   */
  public async validate(): Promise<void> {
    this.currentStatus = LifecycleStatus.VALIDATING;
    // Validation logic would go here
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Execute - Primary operational method
   */
  public async execute(context: Record<string, unknown> = {}): Promise<unknown> {
    this.currentStatus = LifecycleStatus.EXECUTING;

    // Reset results for new execution
    this.executionResults = {
      success: false,
      generated: [],
      errors: [],
      warnings: [],
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0,
      },
    };

    // Execute through plugin aggregator (will be set by lifecycle builder)
    const pluginAggregator = this.children.get('PluginAggregator');
    if (pluginAggregator) {
      try {
        const pluginResults = await pluginAggregator.execute(context);
        this.executionResults.stats.pluginsExecuted =
          (pluginResults as { pluginsExecuted?: number }).pluginsExecuted ?? 0;
      } catch (error) {
        this.executionResults.errors.push(`Plugin execution failed: ${(error as Error).message}`);
      }
    }

    // For now, just mark as successful
    this.executionResults.success = this.executionResults.errors.length === 0;
    this.currentStatus = LifecycleStatus.READY;
    return this.executionResults;
  }

  /**
   * Cleanup - Resource cleanup and shutdown
   */
  public async cleanup(): Promise<void> {
    this.currentStatus = LifecycleStatus.CLEANING;
    // Cleanup child components
    for (const child of this.children.values()) {
      if ('cleanup' in child && typeof child.cleanup === 'function') {
        await child.cleanup();
      }
    }
    this.children.clear();
    this.currentStatus = LifecycleStatus.DESTROYED;
  }

  /**
   * Debug - Return diagnostic information
   */
  public debug(): Record<string, unknown> {
    return {
      spec: this.spec,
      status: this.currentStatus,
      executionResults: this.executionResults,
      children: Array.from(this.children.keys()),
    };
  }

  /**
   * Reset - State reset for testing
   */
  public async reset(): Promise<void> {
    await this.cleanup();
    this.executionResults = {
      success: false,
      generated: [],
      errors: [],
      warnings: [],
      stats: {
        pluginsExecuted: 0,
        specsProcessed: 0,
        filesGenerated: 0,
      },
    };
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   * Status - Return current lifecycle state
   */
  public status(): LifecycleStatus {
    return this.currentStatus;
  }

  /**
   * Get the execution results
   * @returns Copy of the execution results
   */
  public getExecutionResults(): ExecutionResults {
    return { ...this.executionResults };
  }
}
