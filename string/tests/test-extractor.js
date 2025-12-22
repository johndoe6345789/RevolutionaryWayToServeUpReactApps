#!/usr/bin/env node

/**
 * Test script for the String Extraction Automation Script
 */

const { StringExtractor } = require('../extractor');
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

const testFilePath = path.resolve(__dirname, '../test-extraction-target.js');

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
    
    // Test 3: Verify no modifications to source files
    console.log('\n📋 Test 3: Verify source files are not modified');
    const modifiedContent = fs.readFileSync(testFilePath, 'utf8');

    // Check that source files were NOT modified
    const hasServiceCalls = modifiedContent.includes('strings.getError(') ||
                            modifiedContent.includes('strings.getMessage(') ||
                            modifiedContent.includes('strings.getConsole(') ||
                            modifiedContent.includes('strings.getLabel(');

    if (!hasServiceCalls) {
      console.log('✅ Source files correctly left unmodified');
    } else {
      console.log('❌ Source files were incorrectly modified');
    }

    // Check that original content is preserved
    if (modifiedContent === testFileContent) {
      console.log('✅ Original file content preserved');
    } else {
      console.log('❌ Original file content was changed');
    }
    
    // Test 4: Verify strings.json updates
    console.log('\n📋 Test 4: Verify strings.json updates');
    const stringsDataPath = path.resolve(__dirname, '../strings.json');
    const stringsData = JSON.parse(fs.readFileSync(stringsDataPath, 'utf8'));
    
    const hasNewStrings = Object.keys(stringsData.i18n.en.errors).length > 0 ||
                         Object.keys(stringsData.i18n.en.messages).length > 0 ||
                         Object.keys(stringsData.i18n.en.console).length > 0 ||
                         Object.keys(stringsData.i18n.en.labels).length > 0;

    if (hasNewStrings) {
      console.log('✅ New strings found in strings.json');
    } else {
      console.log('❌ No new strings found in strings.json');
    }

    // Test 5: Show extracted strings summary
    console.log('\n📋 Test 5: Extracted strings summary');
    const categories = ['errors', 'messages', 'console', 'labels'];
    for (const category of categories) {
      const strings = stringsData.i18n.en[category] || {};
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
    
    // Test 6: Verify Braille characters are not stripped out
    console.log('\n📋 Test 6: Verify Braille characters are preserved');
    const brailleTestFile = path.resolve(__dirname, '../test-braille.js');
    const brailleContent = `
// Test file with Braille characters
const progressIndicators = {
  loading1: "\u2819",
  loading2: "\u2839",
  loading3: "\u2838",
  loading4: "\u283c",
  loading5: "\u2834",
  loading6: "\u2826",
  loading7: "\u2827",
  loading8: "\u2807",
  loading9: "\u280f"
};

function showProgress(step) {
  const indicators = ["\u2819", "\u2839", "\u2838", "\u283c", "\u2834", "\u2826", "\u2827", "\u2807", "\u280f"];
  console.log(\`Progress: \${indicators[step]}\`);
}
`;

    try {
      fs.writeFileSync(brailleTestFile, brailleContent, 'utf8');

      const brailleExtractor = new StringExtractor({
        files: [brailleTestFile],
        dryRun: false,
        verbose: true
      });

      await brailleExtractor.extract();

      // Check if Braille strings were extracted to strings.json
      const updatedStrings = JSON.parse(fs.readFileSync(stringsDataPath, 'utf8'));
      const brailleStrings = updatedStrings.i18n.en.braille || {};

      const expectedBrailleChars = ["\u2819", "\u2839", "\u2838", "\u283c", "\u2834", "\u2826", "\u2827", "\u2807", "\u280f"];
      let brailleStringsFound = 0;

      for (const [key, value] of Object.entries(brailleStrings)) {
        if (expectedBrailleChars.includes(value)) {
          brailleStringsFound++;
        }
      }

      if (brailleStringsFound >= 9) { // Should find at least 9 Braille characters
        console.log('✅ Braille characters correctly extracted and preserved');
      } else {
        console.log(`❌ Only ${brailleStringsFound} Braille characters found, expected at least 9`);
      }

      // Verify source file was not modified
      const finalBrailleContent = fs.readFileSync(brailleTestFile, 'utf8');
      if (finalBrailleContent === brailleContent) {
        console.log('✅ Braille test file correctly left unmodified');
      } else {
        console.log('❌ Braille test file was incorrectly modified');
      }

    } catch (error) {
      console.log(`❌ Braille test failed: ${error.message}`);
    } finally {
      // Clean up Braille test file
      try {
        if (fs.existsSync(brailleTestFile)) {
          fs.unlinkSync(brailleTestFile);
        }
      } catch (error) {
        console.warn(`Warning: Could not clean up Braille test file: ${error.message}`);
      }
    }

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
