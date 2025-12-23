#!/usr/bin/env bun

/**
 * Build script for Revolutionary Codegen
 * Uses Bun for fast compilation and bundling
 */

import { $ } from 'bun';
import { existsSync, mkdirSync } from 'fs';

async function main(): Promise<void> {
  console.log('🚀 Building Revolutionary Codegen...');

  // Ensure output directories exist
  const dirs = ['dist', 'generated'];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  try {
    // Run linting first
    console.log('📋 Running linter...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await $`bun run lint.ts`;

    // Run tests
    console.log('🧪 Running tests...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await $`bun test`;

    // Generate bootstrap system
    console.log('🔧 Generating bootstrap system...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await $`bun run scripts/generate-bootstrap.ts`;

    // Bundle CLI
    console.log('📦 Bundling CLI...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await $`bun build codegen.js --outdir dist --target node`;

    // Generate documentation
    console.log('📚 Generating documentation...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await $`bun run scripts/generate-docs.ts`;

    console.log('✅ Build completed successfully!');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Build failed: ${errorMessage}`);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}
