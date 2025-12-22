#!/usr/bin/env node

/**
 * Demo script for Nested Aggregate Classes System
 * Demonstrates OO compliance, nested aggregates, and plugin groups
 */

const ClassRegistryAggregate = require('./aggregate/class-registry-aggregate.js');
const { getStringService } = require('../string/string-service');
const path = require('path');

const strings = getStringService();

async function demonstrateNestedAggregates() {
  console.log(strings.getConsole('nested_aggregate_classes_system_demo'));
  console.log('='.repeat(50));

  try {
    // Initialize the class registry with nested aggregates and plugin groups
    console.log(strings.getConsole('n_initializing_class_registry_with_enhanced_featur'));
    const registry = new ClassRegistryAggregate({
      constantsPath: path.join(__dirname, 'aggregate', 'class-constants.json')
    });
    
    await registry.initialize();
    
    // Display system status
    console.log(strings.getConsole('n_system_status'));
    const status = registry.getSystemStatus();
    console.log(JSON.stringify(status, null, 2));

    // Demonstrate nested aggregates
    console.log(strings.getConsole('n_nested_aggregates'));
    if (status.nestedAggregates.enabled) {
      const nestedAggregate = registry.getNestedAggregate();
      if (nestedAggregate) {
        const tree = nestedAggregate.getAggregateTree();
        console.log(JSON.stringify(tree, null, 2));
        
        console.log(strings.getConsole('n_hierarchy_statistics'));
        const stats = nestedAggregate.getHierarchyStats();
        console.log(JSON.stringify(stats, null, 2));

        console.log(strings.getConsole('n_hierarchy_validation'));
        const validation = nestedAggregate.validateHierarchy();
        console.log(JSON.stringify(validation, null, 2));
      }
    } else {
      console.log(strings.getConsole('nested_aggregates_are_disabled'));
    }

    // Demonstrate plugin groups
    console.log(strings.getConsole('n_plugin_groups'));
    if (status.pluginGroups.enabled) {
      const pluginGroupAggregate = registry.getPluginGroupAggregate();
      if (pluginGroupAggregate) {
        const allGroups = pluginGroupAggregate.getAllPluginGroups();
        console.log(JSON.stringify(allGroups, null, 2));
        
        console.log(strings.getConsole('n_group_statistics'));
        const groupStats = pluginGroupAggregate.getGroupStatistics();
        console.log(JSON.stringify(groupStats, null, 2));

        console.log(strings.getConsole('n_dependency_graph'));
        const depGraph = pluginGroupAggregate.getDependencyGraph();
        console.log(JSON.stringify(depGraph, null, 2));

        console.log(strings.getConsole('n_system_validation'));
        const systemValidation = pluginGroupAggregate.validateSystem();
        console.log(JSON.stringify(systemValidation, null, 2));
      }
    } else {
      console.log(strings.getConsole('plugin_groups_are_disabled'));
    }
    
    // Demonstrate dynamic method generation
    console.log(strings.getConsole('n_dynamic_methods_available'));
    const allClasses = registry.getAllClasses();
    console.log(strings.getConsole('total_classes_registered_allclasses_length', { allClasses }));

    for (const cls of allClasses.slice(0, 5)) { // Show first 5
      const methodName = `get${cls.name}`;
      console.log(strings.getConsole('methodname', { methodName }));
    }

    // Test creating an instance using generated method
    console.log(strings.getConsole('n_testing_instance_creation'));
    if (allClasses.length > 0) {
      const firstClass = allClasses[0];
      const methodName = `get${firstClass.name}`;

      if (typeof registry[methodName] === 'function') {
        try {
          console.log(strings.getConsole('attempting_to_create_firstclass_name_instance', { firstClass }));
          // Note: This would fail if factories don't exist, but demonstrates the pattern
          // const instance = await registry[methodName]({ test: true });
          // console.log(`Instance created: ${instance.constructor.name}`);
          console.log(strings.getConsole('method_exists_and_is_callable_factory_would_be_cre'));
        } catch (error) {
          console.log(strings.getConsole('expected_error_missing_factory_error_message', { error }));
        }
      }
    }

    // Demonstrate JS calculation in constants
    console.log(strings.getConsole('n_calculated_constants'));
    if (registry.processedConstants) {
      console.log(strings.getConsole('version'), registry.processedConstants.version);
      console.log(strings.getConsole('generated'), registry.processedConstants.generated);
      console.log(strings.getConsole('available_functions'), Object.keys(registry.processedConstants.functions || {}));
    }

    console.log(strings.getConsole('n_demo_completed_successfully'));
    
  } catch (error) {
    console.error(strings.getConsole('demo_failed'), error.message);
    console.error(error.stack);
  }
}

async function demonstratePluginGeneration() {
  console.log(strings.getConsole('n_n_plugin_generator_demo'));
  console.log(strings.getConsole('report_separator'));

  try {
    const PluginGeneratorPlugin = require('./plugins/plugin-generator/plugin-generator.plugin.js');

    const generator = new PluginGeneratorPlugin();

    // Mock context for plugin generation
    const mockContext = {
      options: {
        name: 'demo-plugin',
        category: 'utility',
        description: 'Demo plugin generated from nested system',
        author: 'RWTRA Demo',
        template: 'basic-plugin',
        output: path.join(__dirname, 'generated-demo-plugin')
      },
      colors: {
        reset: '',
        cyan: '',
        yellow: '',
        green: '',
        magenta: '',
        gray: ''
      }
    };

    console.log(strings.getConsole('generating_demo_plugin'));
    const results = await generator.execute(mockContext);

    console.log(strings.getConsole('plugin_generation_results'));
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error(strings.getConsole('plugin_generation_demo_failed'), error.message);
    // Don't show stack for expected errors
  }
}

// Run demonstrations
async function runDemos() {
  console.log(strings.getConsole('starting_nested_aggregate_system_demonstrations_n'));

  await demonstrateNestedAggregates();
  await demonstratePluginGeneration();

  console.log(strings.getConsole('n_key_features_demonstrated'));
  console.log(strings.getConsole('nested_aggregate_classes_with_hierarchy_support'));
  console.log(strings.getConsole('plugin_groups_with_dependencies_and_load_order'));
  console.log(strings.getConsole('js_calculation_in_constants'));
  console.log(strings.getConsole('dynamic_method_generation'));
  console.log(strings.getConsole('oo_compliance_enforcement'));
  console.log(strings.getConsole('plugin_skeleton_generation'));
  console.log(strings.getConsole('factory_pattern_implementation'));
  console.log(strings.getConsole('data_class_validation'));
  console.log(strings.getConsole('initialize_execute_pattern'));

  console.log(strings.getConsole('n_all_components_follow_strict_oo_principles'));
  console.log(strings.getConsole('single_dataclass_constructor_parameter'));
  console.log(strings.getConsole('initialize_method_always_present'));
  console.log(strings.getConsole('execute_method_single_business_method'));
  console.log(strings.getConsole('factory_pattern_for_instantiation'));
  console.log(strings.getConsole('data_classes_for_configuration'));
  console.log(strings.getConsole('base_class_inheritance'));
  console.log(strings.getConsole('json_metadata_with_js_calculations'));
  console.log(strings.getConsole('nested_hierarchy_support'));
  console.log(strings.getConsole('plugin_grouping_system'));

  console.log(strings.getConsole('n_nested_aggregate_classes_system_implementation_c'));
}

// Run if called directly
if (require.main === module) {
  runDemos().catch(console.error);
}

module.exports = {
  demonstrateNestedAggregates,
  demonstratePluginGeneration,
  runDemos
};
