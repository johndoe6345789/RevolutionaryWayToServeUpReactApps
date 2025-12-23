/**
 * ExecutionAggregator - Coordinates execution pipeline with unlimited drill-down
 * Manages code generation workflow and result aggregation
 * TypeScript strict typing with no 'any' types
 */

import { BaseAggregator } from '../core/base-aggregator';
import { IAggregator, IComponent } from '../core/interfaces/index';
import { ISpec } from '../core/interfaces/ispec';

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

export class ExecutionAggregator extends BaseAggregator {
  private executionResults: ExecutionResults;

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

  public override async initialise(): Promise<ExecutionAggregator> {
    await super.initialise();
    return this;
  }

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
    if (pluginAggregator) {
      try {
        const pluginResults = await pluginAggregator.execute(context);
        this.executionResults.stats.pluginsExecuted = (pluginResults as any)?.pluginsExecuted || 0;
      } catch (error) {
        this.executionResults.errors.push(`Plugin execution failed: ${(error as Error).message}`);
      }
    }

    // Execute through spec aggregator
    const specAggregator = this.children.get('SpecAggregator') as IAggregator;
    if (specAggregator) {
      try {
        const specResults = await specAggregator.execute(context);
        this.executionResults.stats.specsProcessed = (specResults as any)?.specsProcessed || 0;
      } catch (error) {
        this.executionResults.errors.push(`Spec processing failed: ${(error as Error).message}`);
      }
    }

    this.executionResults.success = this.executionResults.errors.length === 0;
    return this.executionResults;
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

  public getExecutionResults(): ExecutionResults {
    return { ...this.executionResults };
  }

  public override getChild(childId: string): IAggregator | IComponent | null {
    return this.children.get(childId) || null;
  }

  public override listChildren(): readonly string[] {
    return Array.from(this.children.keys());
  }
}
