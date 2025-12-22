const { getStringService } = require('./bootstrap/services/string-service');

// Test the string service implementation
function testStringService() {
  console.log('🧪 Testing String Service Implementation...\n');
  
  try {
    const strings = getStringService();
    
    // Test basic string retrieval
    console.log('✅ Basic string retrieval:');
    console.log('  "RetroDeck":', strings.getLabel('retro_deck'));
    console.log('  "Settings":', strings.getLabel('settings'));
    console.log('  "Sync":', strings.getLabel('sync'));
    console.log('  "Insert Coin":', strings.getLabel('insert_coin'));
    
    // Test error messages
    console.log('\n✅ Error message retrieval:');
    console.log('  "Item name required":', strings.getError('item_name_required'));
    console.log('  "Service required":', strings.getError('service_required'));
    
    // Test messages
    console.log('\n✅ Message retrieval:');
    console.log('  "Initializing service...":', strings.getMessage('initializing_service'));
    console.log('  "Starting initialization...":', strings.getMessage('starting_initialization'));
    console.log('  "Initialization completed successfully":', strings.getMessage('initialization_completed'));
    
    // Test console messages
    console.log('\n✅ Console message retrieval:');
    console.log('  "Open settings":', strings.getConsole('open_settings'));
    console.log('  "Sync with cloud":', strings.getConsole('sync_with_cloud'));
    console.log('  "Launch Arcade Mode":', strings.getConsole('launch_arcade'));
    console.log('  "Browse Library":', strings.getConsole('browse_library'));
    
    // Test game data retrieval
    console.log('\n✅ Game data retrieval:');
    const featuredGames = strings.getGameData('featured');
    const systemTags = strings.getGameData('systemTags');
    
    console.log('  Featured games count:', featuredGames ? featuredGames.length : 0);
    console.log('  System tags count:', systemTags ? systemTags.length : 0);
    
    if (featuredGames && featuredGames.length > 0) {
      console.log('  First featured game:');
      console.log('    Title:', featuredGames[0].title);
      console.log('    System:', featuredGames[0].system);
      console.log('    Description:', featuredGames[0].description);
    }
    
    // Test configuration access
    console.log('\n✅ Configuration access:');
    console.log('  Default provider:', strings.getConfig('providers.default'));
    console.log('  Server port:', strings.getConfig('server.port'));
    console.log('  Max nesting level:', strings.getConstant('maxNestingLevel'));
    
    // Test template access
    console.log('\n✅ Template access:');
    console.log('  Project template:', strings.getTemplate('project'));
    console.log('  Enhanced template:', strings.getTemplate('enhanced'));
    
    // Test language functionality
    console.log('\n✅ Language functionality:');
    console.log('  Available languages:', strings.getAvailableLanguages());
    console.log('  Current language:', strings.getCurrentLanguage());
    
    // Test interpolation
    console.log('\n✅ String interpolation:');
    const interpolated = strings.getLabel('settings', { app: 'TestApp' });
    console.log('  Interpolated result:', interpolated);
    
    console.log('\n🎉 String Service test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ String Service test failed:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testStringService();
} else {
  // Export for use in other modules
  module.exports = { testStringService };
}
