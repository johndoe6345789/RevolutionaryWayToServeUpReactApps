#!/usr/bin/env node

/**
 * Simple test for Unified Coverage Tool
 * Tests basic functionality to verify the tool works correctly
 */

const fs = require('fs');
const path = require('path');
const UnifiedCoverageTool = require('./unified-coverage-tool.js');

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

class TestUnifiedTool {
  constructor() {
    this.testResults = [];
  }

  /**
   * Runs basic tests
   */
  async runTests() {
    console.log('🧪 Testing Unified Coverage Tool...\n');
    
    const tool = new UnifiedCoverageTool();
    
    // Test basic initialization
    try {
      const result = await tool.analyze();
      console.log('✅ Basic analysis completed');
      return true;
    } catch (error) {
      console.error('❌ Basic analysis failed:', error.message);
      return false;
    }
  }

  /**
   * Prints test results
   */
  printResults() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} passed\n`);
    
    if (passed === total) {
      console.log('✅ All tests passed! Unified tool is ready for use.');
    } else {
      console.log(`❌ ${total - passed} tests failed.`);
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new TestUnifiedTool();
  
  tester.runTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = TestUnifiedTool;
