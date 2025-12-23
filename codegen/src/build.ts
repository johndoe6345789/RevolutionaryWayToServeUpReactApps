#!/usr/bin/env bun

/**
 * Build script for Revolutionary Codegen
 * Uses Bun for fast compilation and bundling
 */

import { $ } from 'bun';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
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
    await $`bun run lint.ts`;

    // Run tests
    console.log('🧪 Running tests...');
    await $`bun test`;

    // Generate bootstrap system
    console.log('🔧 Generating bootstrap system...');
    await $`bun run scripts/generate-bootstrap.ts`;

    // Bundle CLI
    console.log('📦 Bundling CLI...');
    await $`bun build codegen.js --outdir dist --target node`;

    // Generate documentation
    console.log('📚 Generating documentation...');
    await $`bun run scripts/generate-docs.ts`;

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
