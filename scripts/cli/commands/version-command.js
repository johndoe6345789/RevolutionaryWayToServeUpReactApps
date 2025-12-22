/**
 * Version Command
 * Displays version information
 */

const BaseCommand = require('./base-command');
const { loadPackageJson } = require('../utils/cli-utils');

class VersionCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'version';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Shows version information';
  }

  /**
   * Executes version command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const packageJson = loadPackageJson();
    
    console.log(this.colors.cyan + '🚀 DEV CLI' + this.colors.reset);
    console.log(`Version: ${packageJson.version || '1.0.0'}`);
    console.log(`${this.colors.green}Languages: ${this.languageRegistry.getLanguageCount()}${this.colors.reset}`);
    console.log(`${this.colors.green}Plugins: ${this.pluginRegistry.getPluginCount()}${this.colors.reset}`);
  }
}

module.exports = VersionCommand;
