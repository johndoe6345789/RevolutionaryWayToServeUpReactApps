/**
 * ExecutionAggregator - Coordinates execution pipeline with unlimited drill-down
 * Manages code generation workflow and result aggregation
 * TypeScript strict typing with no 'any' types
 */

import { BaseAggregator } from '../core/base-aggregator';
import type { IAggregator, IComponent } from '../core/interfaces/index';
import type { ISpec } from '../core/interfaces/ispec';

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
 * ExecutionAggregator - Coordinates execution pipeline with unlimited drill-down
 * Manages code generation workflow and result aggregation
 * TypeScript strict typing with no 'any' types
 */
export class ExecutionAggregator extends BaseAggregator {
  /** Execution results tracking the outcome of code generation operations */
  private executionResults: ExecutionResults;

  /**
   * Create a new ExecutionAggregator
   * @param spec The specification for this aggregator
   */
  constructor(spec: ISpec) {
    super(spec);
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
   * Initialize the execution aggregator
   * @returns Promise resolving to this aggregator instance
   */
  public override async initialise(): Promise<ExecutionAggregator> {
    await super.initialise();
    return this;
  }

  /**
   * Execute the code generation workflow
   * @param context Execution context
   * @returns Promise resolving to execution results
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    await super.execute(context);

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

    // Execute through plugin aggregator
    const pluginAggregator = this.children.get('PluginAggregator') as IAggregator;
    try {
      const pluginResults = await pluginAggregator.execute(context);
      this.executionResults.stats.pluginsExecuted =
        (pluginResults as { pluginsExecuted?: number }).pluginsExecuted ?? 0;
    } catch (error) {
      this.executionResults.errors.push(`Plugin execution failed: ${(error as Error).message}`);
    }

    // Execute through spec aggregator
    const specAggregator = this.children.get('SpecAggregator') as IAggregator;
    try {
      const specResults = await specAggregator.execute(context);
      this.executionResults.stats.specsProcessed =
        (specResults as { specsProcessed?: number }).specsProcessed ?? 0;
    } catch (error) {
      this.executionResults.errors.push(`Spec processing failed: ${(error as Error).message}`);
    }

    this.executionResults.success = this.executionResults.errors.length === 0;
    return this.executionResults;
  }

  /**
   * Shutdown the execution aggregator and all child aggregators
   * @returns Promise that resolves when shutdown is complete
   */
  public override async shutdown(): Promise<void> {
    // Shutdown child aggregators
    for (const [, child] of this.children) {
      if ('shutdown' in child && typeof child.shutdown === 'function') {
        await (
          child as {
            /**
             *
             */
            shutdown: () => Promise<void>;
          }
        ).shutdown();
      }
    }
    await super.shutdown();
  }

  /**
   * Get the execution results
   * @returns Copy of the execution results
   */
  public getExecutionResults(): ExecutionResults {
    return { ...this.executionResults };
  }

  /**
   * Get a child component by ID
   * @param childId The ID of the child to retrieve
   * @returns The child component or null if not found
   */
  public override getChild(childId: string): IAggregator | IComponent | null {
    return this.children.get(childId) ?? null;
  }

  /**
   * List all child component IDs
   * @returns Array of child component IDs
   */
  public override listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }
}
