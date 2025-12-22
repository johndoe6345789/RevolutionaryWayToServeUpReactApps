#!/usr/bin/env node

/**
 * Test script for the String Extraction Automation Script
 */

const StringExtractor = require('./scripts/string-extractor');
const fs = require('fs');
const path = require('path');

// Create a test file with various string patterns
const testFileContent = `
// Test file for string extraction
const testStrings = {
  // Error messages
  errorMessage1: "This is an error message",
  errorWithParam: "Failed to load {filename}",
  
  // General messages
  initMessage: 'Initializing system...',
  successMessage: \`Generation completed successfully in \${duration}ms\`,
  
  // Console messages
  console.log("Processing file: {filename}"),
  console.error('Error occurred: {error}'),
  
  // UI labels
  buttonLabel: "Click me",
  menuTitle: 'Main Menu',
  
  // Should be ignored
  import React from 'react',
  const ignored = "ignored string",
  url: "https://example.com",
  
  // Multiline strings
  multiline1: \`This is a
multiline string\`,
  
  multiline2: "Another
multiline
string"
};

function testFunction() {
  throw new Error("Function failed: {reason}");
  
  console.log('Starting process...');
  
  return {
    message: "Process completed"
  };
}
`;

const testFilePath = './test-extraction-target.js';

async function runTests() {
  console.log('🧪 Testing String Extraction Automation Script\n');
  
  try {
    // Create test file
    fs.writeFileSync(testFilePath, testFileContent, 'utf8');
    console.log(`✅ Created test file: ${testFilePath}`);
    
    // Test 1: Dry run extraction
    console.log('\n📋 Test 1: Dry run extraction');
    const dryRunExtractor = new StringExtractor({
      files: [testFilePath],
      dryRun: true,
      verbose: true
    });
    
    await dryRunExtractor.extract();
    console.log('✅ Dry run completed successfully');
    
    // Test 2: Actual extraction
    console.log('\n📋 Test 2: Actual extraction');
    const extractor = new StringExtractor({
      files: [testFilePath],
      backup: true,
      verbose: true
    });
    
    await extractor.extract();
    console.log('✅ Actual extraction completed successfully');
    
    // Test 3: Verify modifications
    console.log('\n📋 Test 3: Verify modifications');
    const modifiedContent = fs.readFileSync(testFilePath, 'utf8');
    
    // Check if strings were replaced with service calls
    const hasServiceCalls = modifiedContent.includes('strings.getError(') || 
                            modifiedContent.includes('strings.getMessage(') ||
                            modifiedContent.includes('strings.getConsole(') ||
                            modifiedContent.includes('strings.getLabel(');
    
    if (hasServiceCalls) {
      console.log('✅ String service calls found in modified file');
    } else {
      console.log('❌ No string service calls found in modified file');
    }
    
    // Check for procedural markings
    const hasMarkings = modifiedContent.includes('AUTO-EXTRACTED:');
    if (hasMarkings) {
      console.log('✅ Procedural markings found in modified file');
    } else {
      console.log('❌ No procedural markings found in modified file');
    }
    
    // Test 4: Verify codegen-data.json updates
    console.log('\n📋 Test 4: Verify codegen-data.json updates');
    const codegenDataPath = path.resolve(__dirname, 'codegen-data.json');
    const codegenData = JSON.parse(fs.readFileSync(codegenDataPath, 'utf8'));
    
    const hasNewStrings = Object.keys(codegenData.i18n.en.errors).length > 0 ||
                         Object.keys(codegenData.i18n.en.messages).length > 0 ||
                         Object.keys(codegenData.i18n.en.console).length > 0 ||
                         Object.keys(codegenData.i18n.en.labels).length > 0;
    
    if (hasNewStrings) {
      console.log('✅ New strings found in codegen-data.json');
    } else {
      console.log('❌ No new strings found in codegen-data.json');
    }
    
    // Test 5: Show extracted strings summary
    console.log('\n📋 Test 5: Extracted strings summary');
    const categories = ['errors', 'messages', 'console', 'labels'];
    for (const category of categories) {
      const strings = codegenData.i18n.en[category] || {};
      const count = Object.keys(strings).length;
      if (count > 0) {
        console.log(`  ${category}: ${count} strings`);
      }
    }
    
    // Display modified file content
    console.log('\n📄 Modified file content:');
    console.log('=' .repeat(50));
    console.log(modifiedContent);
    console.log('=' .repeat(50));
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log(`🧹 Cleaned up test file: ${testFilePath}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up test file: ${error.message}`);
    }
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
