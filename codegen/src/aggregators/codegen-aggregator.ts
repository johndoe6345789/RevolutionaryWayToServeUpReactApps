/**
 * CodegenAggregator - Root aggregator with unlimited drill-down navigation
 * Orchestrates the entire codegen system through hierarchical aggregators
 * TypeScript strict typing with no 'any' types
 */

import { BaseAggregator } from '../core/base-aggregator';
import { PluginAggregator } from './plugin-aggregator';
import { ExecutionAggregator } from './execution-aggregator';
import type { IAggregator, IComponent } from '../core/interfaces/index';
import type { ISpec } from '../core/interfaces/ispec';

/**
 * CodegenAggregator - Root aggregator with unlimited drill-down navigation
 * Orchestrates the entire codegen system through hierarchical aggregators
 * TypeScript strict typing with no 'any' types
 */
export class CodegenAggregator extends BaseAggregator {
  /**
   * Create a new CodegenAggregator
   * @param spec The specification for this aggregator
   */
  constructor(spec: ISpec) {
    super(spec);
  }

  /**
   * Initialize the codegen aggregator and its child aggregators
   * @returns Promise resolving to this aggregator instance
   */
  public override async initialise(): Promise<CodegenAggregator> {
    await super.initialise();

    // Create and initialize child aggregators
    const pluginAggregator = new PluginAggregator({
      uuid: 'plugin-agg-uuid',
      id: 'PluginAggregator',
      type: 'aggregator',
      search: {
        title: 'Plugin Aggregator',
        summary: 'Manages plugin discovery and loading',
        keywords: ['plugin', 'aggregator'],
        domain: 'core',
        capabilities: ['discovery', 'loading'],
      },
    });

    const executionAggregator = new ExecutionAggregator({
      uuid: 'exec-agg-uuid',
      id: 'ExecutionAggregator',
      type: 'aggregator',
      search: {
        title: 'Execution Aggregator',
        summary: 'Coordinates code generation execution',
        keywords: ['execution', 'aggregator'],
        domain: 'core',
        capabilities: ['execution', 'coordination'],
      },
    });

    // Initialize aggregators
    await pluginAggregator.initialise();
    await executionAggregator.initialise();

    // Add to hierarchy
    this.children.set('PluginAggregator', pluginAggregator);
    this.children.set('ExecutionAggregator', executionAggregator);

    // Connect execution aggregator to plugin aggregator (using protected access)
    (
      executionAggregator as ExecutionAggregator & {
        children: Map<string, IComponent | IAggregator>;
      }
    ).children.set('PluginAggregator', pluginAggregator);

    return this;
  }

  /**
   * Execute the code generation process
   * @param context Execution context
   * @returns Promise resolving to execution result
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    await super.execute(context);

    // Execute through execution aggregator
    const executionAggregator = this.children.get('ExecutionAggregator') as ExecutionAggregator;
    return await executionAggregator.execute(context);
  }

  /**
   * Shutdown the aggregator and all child aggregators
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
            shutdown(): Promise<void>;
          }
        ).shutdown();
      }
    }
    await super.shutdown();
  }

  /**
   * Get the plugin aggregator instance
   * @returns PluginAggregator instance or null if not found
   */
  public getPluginAggregator(): PluginAggregator | null {
    const aggregator = this.children.get('PluginAggregator');
    return aggregator ? (aggregator as PluginAggregator) : null;
  }

  /**
   * Get the execution aggregator instance
   * @returns ExecutionAggregator instance or null if not found
   */
  public getExecutionAggregator(): ExecutionAggregator | null {
    const aggregator = this.children.get('ExecutionAggregator');
    return aggregator ? (aggregator as ExecutionAggregator) : null;
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
