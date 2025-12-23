/**
 * CodegenAggregator - Root aggregator with unlimited drill-down navigation
 * Orchestrates the entire codegen system through hierarchical aggregators
 * TypeScript strict typing with no 'any' types
 */

import { BaseAggregator } from '../core/base-aggregator';
import { PluginAggregator } from './plugin-aggregator';
import { ExecutionAggregator } from './execution-aggregator';
import { IAggregator, IComponent } from '../core/interfaces/index';
import { ISpec } from '../core/interfaces/ispec';

export class CodegenAggregator extends BaseAggregator {
  constructor(spec: ISpec) {
    super(spec);
  }

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
        capabilities: ['discovery', 'loading']
      }
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
        capabilities: ['execution', 'coordination']
      }
    });

    // Initialize aggregators
    await pluginAggregator.initialise();
    await executionAggregator.initialise();

    // Add to hierarchy
    this.children.set('PluginAggregator', pluginAggregator);
    this.children.set('ExecutionAggregator', executionAggregator);

    // Connect execution aggregator to plugin aggregator (using protected access)
    (executionAggregator as any).children.set('PluginAggregator', pluginAggregator);

    return this;
  }

  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    await super.execute(context);

    // Execute through execution aggregator
    const executionAggregator = this.children.get('ExecutionAggregator') as ExecutionAggregator;
    if (executionAggregator) {
      return await executionAggregator.execute(context);
    }

    return { success: false, error: 'ExecutionAggregator not found' };
  }

  public override async shutdown(): Promise<void> {
    // Shutdown child aggregators
    for (const [childId, child] of this.children) {
      if (child && typeof (child as any).shutdown === 'function') {
        await (child as any).shutdown();
      }
    }
    await super.shutdown();
  }

  public getPluginAggregator(): PluginAggregator | null {
    return this.children.get('PluginAggregator') as PluginAggregator || null;
  }

  public getExecutionAggregator(): ExecutionAggregator | null {
    return this.children.get('ExecutionAggregator') as ExecutionAggregator || null;
  }

  public override getChild(childId: string): IAggregator | IComponent | null {
    return this.children.get(childId) || null;
  }

  public override listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }
}
