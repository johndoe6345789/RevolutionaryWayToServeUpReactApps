#!/usr/bin/env node

/**
 * Revolutionary Codegen WebUI - Main Entry Point
 * Next.js application providing tree navigation, Monaco editor, search, and runbook generation
 * AGENTS.md compliant: WebUI entry point with mandatory features
 */

import { spawn } from 'child_process';
import { resolve } from 'path';

// WebUI configuration
const WEBUI_DIR = resolve(__dirname, '../../../retro-react-app');
const NEXT_BIN = resolve(WEBUI_DIR, 'node_modules/.bin/next');

/**
 * Start the WebUI server
 */
function startWebUI(): void {
  console.log('🚀 Starting Revolutionary Codegen WebUI...');
  console.log(`📁 WebUI directory: ${WEBUI_DIR}`);
  console.log('📊 Features: Tree navigation, Monaco editor, Full-text search, Runbook generation');

  const nextProcess = spawn(NEXT_BIN, ['dev'], {
    cwd: WEBUI_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: process.env.PORT || '3000',
    },
  });

  nextProcess.on('error', (error) => {
    console.error('❌ Failed to start WebUI:', error.message);
    process.exit(1);
  });

  nextProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ WebUI process exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebUI...');
    nextProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down WebUI...');
    nextProcess.kill('SIGTERM');
  });
}

// Export for programmatic use
export { startWebUI };

// CLI execution
if (require.main === module) {
  startWebUI();
}
