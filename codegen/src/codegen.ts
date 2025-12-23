#!/usr/bin/env node

/**
 * Revolutionary Codegen - Refactored Main Entry Point
 * Now uses entrypoint/aggregator pattern with unlimited drill-down navigation
 * Maintains all original functionality with proper architectural constraints
 * TypeScript strict typing with no 'any' types
 */

import { CodegenEntrypoint } from './entrypoints/index';
import { CodegenAggregator } from './aggregators/index';

// Factory function to create the new architecture
export function createCodegenSystem(options: Record<string, unknown> = {}): {
  entrypoint: CodegenEntrypoint;
  aggregator: CodegenAggregator;
} {
  // Create root aggregator
  const aggregator = new CodegenAggregator({
      uuid: 'root-codegen-uuid',
      id: 'CodegenAggregator',
      type: 'aggregator',
      search: {
        title: 'Codegen Root Aggregator',
        summary: 'Root aggregator for unlimited drill-down navigation',
        keywords: ['codegen', 'root', 'aggregator'],
        domain: 'core',
        capabilities: ['navigation', 'orchestration'],
      },
    }),
    // Create entrypoint
    entrypoint = new CodegenEntrypoint(aggregator, options);

  return { entrypoint, aggregator };
}

// CLI execution with new architecture
if (require.main === module) {
  const { entrypoint } = createCodegenSystem(),
    args = process.argv.slice(2);

  entrypoint.runCLI(args).catch((error: unknown) => {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

// Export factory for programmatic use
module.exports = { createCodegenSystem };
