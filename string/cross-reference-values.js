const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load strings.json
const stringsPath = path.join(__dirname, 'strings.json');
const strings = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));

// Get all keys from strings.json
const allKeys = new Set();
function collectKeys(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !value.content) {
      collectKeys(value);
    } else {
      allKeys.add(key);
    }
  }
}
collectKeys(strings.i18n.en);

// Define used keys based on grep search results
const usedKeys = new Set([
  // Messages
  'retro_deck', 'settings', 'sync', 'insert_coin', 'item_name_required', 'service_required',
  'initializing_service', 'starting_initialization', 'initialization_completed', 'open_settings',
  'sync_with_cloud', 'launch_arcade', 'browse_library', 'rev_codegen_initializing', 'created_output_dir',
  'initializing_generators', 'executing_codegen', 'files_generated', 'codegen_failed', 'cleaning_up',
  'cleaned_items', 'final_cleanup', 'cleanup_operation', 'cleanup_failed', 'final_cleanup_complete',
  'method_not_implemented', 'created_directory', 'generated_file', 'dry_run_file', 'backed_up_file',
  'dark_mode', 'broke_developer', 'java_glasses', 'sad_function', 'love_nature', 'unlocked', 'keep_going',
  'found_me', 'unicorn_mode', 'ai_watching', 'konami_code', 'infinity_beyond', 'diamond_hands', 'rainbow_mode',
  'all_your_base', 'revolutionary_logo', 'welcome_subtitle', 'completion_celebration_1', 'completion_celebration_2',
  'completion_celebration_3', 'completion_celebration_4', 'completion_celebration_5', 'stats_files_generated',
  'stats_files_backed_up', 'stats_duration', 'stats_innovations_triggered', 'stats_achievements_unlocked',
  'generator_breakdown', 'next_steps', 'next_step_1', 'next_step_2', 'next_step_3', 'next_step_4', 'next_step_5',
  'farewell_message', 'oops_something_went_wrong', 'error_message', 'error_tip_config', 'error_tip_verbose',
  'error_tip_reassurance', 'operation_not_found', 'initializing_nested_aggregates', 'initializing_plugin_groups',
  'hero_description', 'specification_load_failed', 'stats_warnings', 'non_existent_key', 'generating_project_from_spec',
  'launching_spec_editor', 'stats_errors', 'processing_file_filename', 'starting_process',

  // Errors
  'service_required_initialization', 'service_name_required', 'service_type_required', 'dependencies_invalid',
  'config_object_required', 'service_name_invalid', 'factory_type_required', 'target_class_required',
  'data_class_required', 'serviceregistry_must_be_an_object', 'namespace_must_be_an_object', 'configjson_must_be_a_valid_object',
  'failed_to_load_aggregate_hierarchy_error_message', 'nesting_level_aggregate_nestinglevel_exceeds_maxim',
  'failed_to_create_aggregate_name_error_message', 'specification_not_loaded',

  // Console
  'loggingmanager', 'client_log', 'nested_aggregates_initialized', 'plugin_groups_initialized',

  // Labels
  'no_store_no_cache_must_revalidate',

  // Bootstrapper.js specific
  'bootstrapper', 'controllers', 'core', 'main_tsx', 'styles_scss', 'bootstrap_success',
  'fetch_is_unavailable_when_loading_config_json', 'config_json', 'no_store', 'failed_to_load_config_json',
  'ci_enabled', 'string_1b', 'bootstrap_error', 'root'
]);

// Find unused keys
const unusedKeys = [];
for (const key of allKeys) {
  if (!usedKeys.has(key)) {
    unusedKeys.push(key);
  }
}

// Function to get value for a key
function getKeyValue(key) {
  if (strings.i18n.en.messages && strings.i18n.en.messages[key]) return strings.i18n.en.messages[key];
  if (strings.i18n.en.errors && strings.i18n.en.errors[key]) return strings.i18n.en.errors[key];
  if (strings.i18n.en.console && strings.i18n.en.console[key]) return strings.i18n.en.console[key];
  if (strings.i18n.en.labels && strings.i18n.en.labels[key]) return strings.i18n.en.labels[key];
  return null;
}

// Function to search for literal string value in source code
function searchForLiteralValue(value) {
  try {
    // Escape special regex characters and search for the exact string
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const result = execSync(`grep -r "${escapedValue}" --include="*.js" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || true`, {
      encoding: 'utf8',
      cwd: __dirname
    });
    return result.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

// Analyze unused keys and their values
console.log('🔍 DETAILED UNUSED STRING VALUE CROSS-REFERENCE');
console.log('===============================================');
console.log(`Total keys in strings.json: ${allKeys.size}`);
console.log(`Keys used in codebase: ${usedKeys.size}`);
console.log(`Unused keys to analyze: ${unusedKeys.length}`);
console.log('');

const hardcodedStrings = [];
const trulyUnused = [];
let analyzedCount = 0;

console.log('Analyzing unused keys for hardcoded usage...');
console.log('(This may take a moment for 826 keys)');
console.log('');

// Process unused keys in batches to show progress
const batchSize = 50;
for (let i = 0; i < unusedKeys.length; i += batchSize) {
  const batch = unusedKeys.slice(i, i + batchSize);
  console.log(`Processing keys ${i + 1}-${Math.min(i + batchSize, unusedKeys.length)}...`);

  for (const key of batch) {
    const value = getKeyValue(key);
    if (!value) continue;

    analyzedCount++;
    const occurrences = searchForLiteralValue(value);

    if (occurrences.length > 0) {
      hardcodedStrings.push({
        key,
        value,
        occurrences: occurrences.length,
        sampleLocations: occurrences.slice(0, 3) // Keep first 3 locations
      });
    } else {
      trulyUnused.push(key);
    }
  }
}

console.log('\n📊 ANALYSIS COMPLETE');
console.log('===================');
console.log(`Keys analyzed: ${analyzedCount}`);
console.log(`Keys with hardcoded values: ${hardcodedStrings.length}`);
console.log(`Truly unused keys: ${trulyUnused.length}`);
console.log('');

if (hardcodedStrings.length > 0) {
  console.log('⚠️  KEYS WITH HARDCODED VALUES FOUND:');
  console.log('These strings appear literally in the code but are not abstracted through the string service.');
  console.log('Consider refactoring to use the string service for consistency.');
  console.log('');

  // Group by category
  const categorizedHardcoded = {
    messages: [],
    errors: [],
    console: [],
    labels: []
  };

  hardcodedStrings.forEach(item => {
    if (strings.i18n.en.messages && strings.i18n.en.messages[item.key]) {
      categorizedHardcoded.messages.push(item);
    } else if (strings.i18n.en.errors && strings.i18n.en.errors[item.key]) {
      categorizedHardcoded.errors.push(item);
    } else if (strings.i18n.en.console && strings.i18n.en.console[item.key]) {
      categorizedHardcoded.console.push(item);
    } else if (strings.i18n.en.labels && strings.i18n.en.labels[item.key]) {
      categorizedHardcoded.labels.push(item);
    }
  });

  Object.entries(categorizedHardcoded).forEach(([category, items]) => {
    if (items.length > 0) {
      console.log(`${category.toUpperCase()}:`);
      items.slice(0, 10).forEach(item => { // Show first 10 per category
        console.log(`  - "${item.key}": "${item.value}" (${item.occurrences} occurrences)`);
        item.sampleLocations.forEach(loc => {
          console.log(`    └─ ${loc.split(':')[0]}`);
        });
      });
      if (items.length > 10) {
        console.log(`  ... and ${items.length - 10} more`);
      }
      console.log('');
    }
  });
}

if (trulyUnused.length > 0) {
  console.log('🗑️  TRULY UNUSED KEYS:');
  console.log(`These ${trulyUnused.length} keys can be safely removed from strings.json`);
  console.log('(Showing first 20 as example)');
  trulyUnused.slice(0, 20).forEach(key => {
    const value = getKeyValue(key);
    console.log(`  - "${key}": "${value}"`);
  });
  if (trulyUnused.length > 20) {
    console.log(`  ... and ${trulyUnused.length - 20} more`);
  }
  console.log('');
}

console.log('💡 RECOMMENDATIONS:');
console.log(`1. Refactor ${hardcodedStrings.length} hardcoded strings to use the string service`);
console.log(`2. Remove ${trulyUnused.length} truly unused keys from strings.json`);
console.log(`3. Total bundle size reduction opportunity: ${hardcodedStrings.length + trulyUnused.length} keys`);

console.log('');
console.log('Note: This analysis searches for exact string matches in JS files.');
console.log('Some strings may be constructed dynamically or used in other ways.');
