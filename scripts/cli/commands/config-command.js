/**
 * Config Command
 * Manages configuration
 */

const BaseCommand = require('./base-command');

class ConfigCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'config';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Manage configuration';
  }

  /**
   * Executes config command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const subCommand = args[0] || 'show';
    
    switch (subCommand) {
      case 'show':
        this.configManager.showConfig();
        break;
        
      case 'set':
        if (args.length < 3) {
          this.showError('Usage: config set <key> <value>');
          process.exit(1);
        }
        this.configManager.setConfig(args[1], args[2]);
        break;
        
      case 'reset':
        this.configManager.resetConfig();
        this.showSuccess('Configuration reset to defaults');
        break;
        
      default:
        this.showError(`Unknown config command: ${subCommand}`);
        console.log(`${this.colors.yellow}Available: show, set, reset${this.colors.reset}`);
        process.exit(1);
    }
  }
}

module.exports = ConfigCommand;
