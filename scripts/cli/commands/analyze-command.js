/**
 * Analyze Command
 * Runs analysis plugins
 */

const BaseCommand = require('./base-command');
const { parseArgs } = require('../utils/cli-utils');

class AnalyzeCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'analyze';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Run analysis plugins';
  }

  /**
   * Executes analyze command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const options = parseArgs(args);
    
    if (options.all) {
      await this.runAllAnalysisPlugins(options);
    } else {
      this.showError('Please specify analysis type or use --all');
      console.log(`${this.colors.yellow}Available: --all, --dependency, --interface, --coverage${this.colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Runs all analysis plugins
   * @param {Object} options - Analysis options
   */
  async runAllAnalysisPlugins(options) {
    const analysisPlugins = this.pluginRegistry.getPluginsByCategory('analysis');
    
    if (analysisPlugins.length === 0) {
      console.log(`${this.colors.yellow}No analysis plugins found.${this.colors.reset}`);
      return;
    }
    
    console.log(`${this.colors.blue}📊 Running ${analysisPlugins.length} analysis plugins...${this.colors.reset}`);
    
    for (const plugin of analysisPlugins) {
      try {
        console.log(`${this.colors.magenta}\n🔌 Running ${plugin.name}...${this.colors.reset}`);
        await this.executePlugin(plugin.name, options);
      } catch (error) {
        this.showError(`Plugin ${plugin.name} failed: ${error.message}`);
      }
    }
  }
}

module.exports = AnalyzeCommand;
