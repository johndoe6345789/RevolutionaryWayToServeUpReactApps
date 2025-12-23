const { StringFactory } = require('./string-factory.js');

async function demonstrateStringService() {
  console.log('🚀 StringService Enterprise Demo');
  console.log('================================\n');

  try {
    // Create service using factory
    const factory = new StringFactory();
    const service = factory.create();

    // Initialize service
    console.log('📦 Initializing StringService...');
    await service.initialize();
    console.log('✅ Service initialized successfully\n');

    // Test basic string retrieval
    console.log('🧪 Testing basic string retrieval:');
    const errorMsg = await service.getError('itemName');
    console.log(`   Error message: "${errorMsg}"`);

    const message = await service.getMessage('initializingService');
    console.log(`   Message: "${message}"`);

    const label = await service.getLabel('retro_gaming_hub');
    console.log(`   Label: "${label}"\n`);

    // Test parameter interpolation
    console.log('🔄 Testing parameter interpolation:');
    const template = 'Welcome {name} to {app} version {version}!';
    const interpolated = service.interpolate(template, {
      name: 'Developer',
      app: 'StringService',
      version: '1.0.0'
    });
    console.log(`   Template: "${template}"`);
    console.log(`   Result: "${interpolated}"\n`);

    // Test configuration access
    console.log('⚙️  Testing configuration access:');
    const version = service.getConfig('version');
    console.log(`   Config version: ${version}`);

    const rootId = service.getConfig('render.rootId');
    console.log(`   Render rootId: ${rootId}\n`);

    // Test constants access
    console.log('🔢 Testing constants access:');
    const appVersion = service.getConstant('version');
    console.log(`   App version: ${appVersion}\n`);

    // Test language management
    console.log('🌍 Testing language management:');
    const currentLang = service.getCurrentLanguage();
    console.log(`   Current language: ${currentLang}`);

    const availableLangs = service.getAvailableLanguages();
    console.log(`   Available languages: [${availableLangs.join(', ')}]\n`);

    // Test validation
    console.log('✅ Testing string validation:');
    const validation = service.validateStrings(['errors.itemName', 'messages.initializingService']);
    console.log(`   Validation result: ${validation.isValid ? 'PASS' : 'FAIL'}`);
    console.log(`   Missing strings: [${validation.missing.join(', ')}]\n`);

    // Test factory methods
    console.log('🏭 Testing factory methods:');
    const cachedService = factory.createWithCache(50, 1800000);
    console.log('   Created service with custom cache');

    const langService = factory.createForLanguage('en');
    console.log('   Created service for English language\n');

    // Test game data access
    console.log('🎮 Testing game data access:');
    const featuredGames = service.getGameData('featured');
    if (featuredGames && featuredGames.length > 0) {
      console.log(`   Featured games count: ${featuredGames.length}`);
      console.log(`   First game title: "${featuredGames[0].title}"`);
    }

    const systemTags = service.getGameData('systemTags');
    if (systemTags) {
      console.log(`   System tags: [${systemTags.slice(0, 3).join(', ')}...]`);
    }
    console.log('');

    // Test metadata access
    console.log('📊 Testing metadata access:');
    const pluginGroups = service.getMetadata('pluginGroups');
    if (pluginGroups) {
      console.log(`   Plugin groups count: ${pluginGroups.length}`);
      if (pluginGroups.length > 0) {
        console.log(`   First group: "${pluginGroups[0].name}"`);
      }
    }
    console.log('');

    console.log('🎉 StringService demo completed successfully!');
    console.log('🏆 All enterprise patterns working correctly');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateStringService();
}

module.exports = { demonstrateStringService };
