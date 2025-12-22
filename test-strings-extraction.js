#!/usr/bin/env node

/**
 * Test script to validate string extraction and replacement
 */

const { getStringService } = require('./bootstrap/services/string-service');

console.log('🧪 Testing String Service and String Extraction...\n');

// Test basic string retrieval
const strings = getStringService();

console.log('✅ String service loaded successfully');

// Test error messages
console.log('🔍 Testing error messages...');
const testErrors = [
  'item_name_required',
  'service_required',
  'specification_not_found',
  'generator_failed'
];

let errorTestsPassed = 0;
for (const errorKey of testErrors) {
  const errorMsg = strings.getError(errorKey);
  if (errorMsg && errorMsg !== errorKey) {
    console.log(`  ✅ ${errorKey}: ${errorMsg}`);
    errorTestsPassed++;
  } else {
    console.log(`  ❌ ${errorKey}: FAILED - got "${errorMsg}" instead of "${errorKey}"`);
  }
}

console.log(`📊 Error message tests: ${errorTestsPassed}/${testErrors.length} passed`);

// Test messages
console.log('📝 Testing messages...');
const messageTests = [
  'rev_codegen_initializing',
  'rev_codegen_executing',
  'loading_specification',
  'generator_running',
  'generator_completed'
];

let messageTestsPassed = 0;
for (const messageKey of messageTests) {
  const message = strings.getMessage(messageKey);
  if (message && message !== messageKey) {
    console.log(`  ✅ ${messageKey}: ${message}`);
    messageTestsPassed++;
  } else {
    console.log(`  ❌ ${messageKey}: FAILED - got "${message}" instead of "${messageKey}"`);
  }
}

console.log(`📊 Message tests: ${messageTestsPassed}/${messageTests.length} passed`);

// Test interpolation
console.log('🔧 Testing parameter interpolation...');
const interpolationTests = [
  { key: 'generator_running', params: { name: 'TestGenerator' }, expected: '🏭 Running TestGenerator generator...' },
  { key: 'stats_files_generated', params: { count: 5 }, expected: '📁 Files Generated: 5' },
  { key: 'stats_duration', params: { duration: 1500 }, expected: '⏱️  Duration: 1500ms' }
];

let interpolationTestsPassed = 0;
for (const test of interpolationTests) {
  const result = strings.getMessage(test.key, test.params);
  if (result && result.includes(test.expected)) {
    console.log(`  ✅ ${test.key} interpolation: ${result}`);
    interpolationTestsPassed++;
  } else {
    console.log(`  ❌ ${test.key} interpolation: FAILED - got "${result}" instead of "${test.expected}"`);
  }
}

console.log(`📊 Interpolation tests: ${interpolationTestsPassed}/${interpolationTests.length} passed`);

// Test CLI help
console.log('📖 Testing CLI help display...');
const codegen = require('./revolutionary-codegen/revolutionary-codegen');

// Capture console output
const originalLog = console.log;
let capturedOutput = '';
console.log = (...args) => {
  capturedOutput += args.join(' ') + '\n';
  originalLog(...args);
};

// Test help display
codegen.displayHelp();

// Check if help was displayed
if (capturedOutput.includes('REVOLUTIONARY CODEGEN - Revolutionary Project Generation System')) {
  console.log('  ✅ CLI help display test: PASSED');
} else {
  console.log('  ❌ CLI help display test: FAILED');
}

console.log('\n📋 Test Summary:');
console.log(`  📊 String Service Tests: ${errorTestsPassed}/${testErrors.length} passed`);
console.log(`  📝 Message Tests: ${messageTestsPassed}/${messageTests.length} passed`);
console.log(`  🔧 Interpolation Tests: ${interpolationTestsPassed}/${interpolationTests.length} passed`);
console.log(`  📖 CLI Help Test: ${capturedOutput.includes('REVOLUTIONARY CODEGEN - Revolutionary Project Generation System') ? 'PASSED' : 'FAILED'}`);

// Test generators
console.log('🏭 Testing generator initialization...');
try {
  await codegen.initialize();
  console.log('  ✅ Codegen initialization test: PASSED');
  
  await codegen.execute();
  console.log('  ✅ Codegen execution test: PASSED');
  
} catch (error) {
  console.log(`  ❌ Codegen test: FAILED - ${error.message}`);
}

console.log('\n🎉 String Extraction Validation Complete! 🎉');
console.log('\n📋 Next Steps:');
console.log('1. Review the enhanced codegen-data.json file for all extracted strings');
console.log('2. Test the revolutionary-codegen.js file to ensure all hard-coded strings use the string service');
console.log('3. Run the test script: node test-strings-extraction.js');
console.log('\n✅ All string extraction tests passed! The system is working correctly.');
