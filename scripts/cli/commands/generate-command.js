/**
 * Generate Command
 * Runs generation plugins
 */

const BaseCommand = require('./base-command');
const { parseArgs } = require('../utils/cli-utils');

class GenerateCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'generate';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Run generation plugins';
  }

  /**
   * Executes generate command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const options = parseArgs(args);
    
    if (options['api-stubs']) {
      await this.executePlugin('api-stubs', options);
    } else if (options.templates) {
      await this.executePlugin('template-generator', options);
    } else {
      this.showError('Please specify generation type');
      console.log(`${this.colors.yellow}Available: --api-stubs, --templates${this.colors.reset}`);
      process.exit(1);
    }
  }
}

module.exports = GenerateCommand;
