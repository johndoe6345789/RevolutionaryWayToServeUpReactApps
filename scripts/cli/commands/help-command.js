/**
 * Help Command
 * Displays help information for the CLI
 */

const BaseCommand = require('./base-command');

class HelpCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'help';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Shows help information';
  }

  /**
   * Executes the help command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    this.showMainHelp();
  }

  /**
   * Shows main help information
   */
  showMainHelp() {
    console.log(this.colors.cyan + '\n🚀 Development CLI');
    console.log('🛠️  Generic Tool with Language Plugin System' + this.colors.white);
    console.log('='.repeat(60) + this.colors.reset);
    
    console.log(this.colors.yellow + '\n📋 USAGE:');
    console.log('   dev-cli <command> [options]' + this.colors.reset);
    
    console.log(this.colors.green + '\n🚀 CORE COMMANDS:');
    console.log('   analyze        Run analysis plugins');
    console.log('   generate       Run generation plugins');
    console.log('   config         Manage configuration');
    console.log('   plugins        Manage plugins');
    console.log('   languages      Manage language detection' + this.colors.reset);
    
    console.log(this.colors.magenta + '\n🌍 LANGUAGE COMMANDS:');
    const languages = this.languageRegistry.getSupportedLanguages();
    for (const language of languages) {
      console.log(`   ${language.name.padEnd(15)} ${language.description}` + this.colors.reset);
    }
    
    console.log(this.colors.magenta + '\n🔌 PLUGIN COMMANDS:');
    const plugins = this.pluginRegistry.getPlugins();
    for (const plugin of plugins) {
      if (plugin.category !== 'language') {
        console.log(`   ${plugin.name.padEnd(15)} ${plugin.description}` + this.colors.reset);
      }
    }
    
    console.log(this.colors.yellow + '\n⚙️  OPTIONS:');
    console.log('   --help, -h     Show this help message');
    console.log('   --version, -v  Show version information');
    console.log('   --debug        Enable debug output');
    console.log('   --language     Specify language (auto-detected if not provided)' + this.colors.reset);
    
    console.log(this.colors.cyan + '\n📚 EXAMPLES:');
    console.log('   dev-cli analyze --all');
    console.log('   dev-cli dependency-analyze');
    console.log('   dev-cli coverage-report --language python');
    console.log('   dev-cli languages list');
    console.log('   dev-cli plugins list' + this.colors.reset);
  }
}

module.exports = HelpCommand;
