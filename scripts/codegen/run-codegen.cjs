#!/usr/bin/env node

/**
 * Simple wrapper to run codegen in CommonJS mode
 */

const CodegenRunner = require('./codegen-runner');

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--output-dir':
        options.outputDir = value;
        break;
      case '--constants-path':
        options.constantsPath = value;
        break;
      case '--bootstrap-path':
        options.bootstrapPath = value;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Usage: node run-codegen.js [options]

Options:
  --output-dir <path>     Output directory for generated files (default: ./bootstrap/generated)
  --constants-path <path>  Path to class constants JSON (default: ./bootstrap/aggregate/class-constants.json)
  --bootstrap-path <path>  Path to bootstrap directory (default: ./bootstrap)
  --verbose               Enable verbose logging
  --help                 Show this help message

Examples:
  node run-codegen.js --verbose
  node run-codegen.js --output-dir ./generated --constants-path ./config/constants.json
        `);
        process.exit(0);
    }
  }
  
  try {
    const runner = new CodegenRunner(options);
    await runner.initialize();
    await runner.execute();
    
    const stats = runner.getCompleteStats();
    if (stats.combined.overallSuccess) {
      console.log('\n✅ Codegen completed successfully!');
    } else {
      console.log('\n❌ Codegen completed with errors!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n❌ Codegen failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CodegenRunner };
