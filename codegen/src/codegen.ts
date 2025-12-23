#!/usr/bin/env node

/**
 * Revolutionary Codegen - Main Entry Point with Lifecycle
 * Uses lifecycle builder for component orchestration and messaging system
 * CLI and WebUI entry points with drill-down navigation
 * TypeScript strict typing with no 'any' types
 */

import { CodegenEntrypoint } from './entrypoints/index';
import { CodegenAggregator } from './aggregators/index';
import { LifecycleBuilder } from './core/lifecycle/index';

// Factory function to create the complete system
export function createCodegenSystem(options: Record<string, unknown> = {}): {
  entrypoint: CodegenEntrypoint;
  aggregator: CodegenAggregator;
  lifecycle: typeof LifecycleBuilder;
} {
  // Create root aggregator
  const aggregator = new CodegenAggregator({
      uuid: '550e8400-e29b-41d4-a716-446655440000',
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

  return { entrypoint, aggregator, lifecycle: LifecycleBuilder };
}

// CLI and WebUI execution with dual entry points
if (require.main === module) {
  const args = process.argv.slice(2);

  // Check if WebUI mode is requested
  if (args.includes('--webui') || args.includes('webui')) {
    // Start WebUI
    const { startWebUI } = require('./webui/index');
    startWebUI();
  } else {
    // Run CLI
    const { entrypoint } = createCodegenSystem();
    entrypoint.runCLI(args).catch((error: unknown) => {
      console.error('Fatal error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
  }
}

// Export factory for programmatic use
module.exports = { createCodegenSystem };
