#!/usr/bin/env node

/**
 * DEV CLI - Development Command Line Interface
 * Generic tool with language plugin system for managing analysis and generation tools
 */

// Import refactored CLI
const DEVCLI = require('./cli/dev-cli');

// CLI execution
if (require.main === module) {
  const cli = new DEVCLI();
  cli.run().catch(error => {
    console.error('❌ CLI execution failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

module.exports = DEVCLI;
