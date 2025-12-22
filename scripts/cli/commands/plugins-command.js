/**
 * Plugins Command
 * Manages plugin discovery and information
 */

const BaseCommand = require('./base-command');

class PluginsCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'plugins';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Manage plugins';
  }

  /**
   * Executes plugins command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const subCommand = args[0] || 'list';
    
    switch (subCommand) {
      case 'list':
        this.listPlugins();
        break;
        
      case 'info':
        await this.showPluginInfo(args[1]);
        break;
        
      case 'reload':
        await this.reloadPlugins();
        break;
        
      default:
        this.showError(`Unknown plugins command: ${subCommand}`);
        console.log(`${this.colors.yellow}Available: list, info, reload${this.colors.reset}`);
        process.exit(1);
    }
  }

  /**
   * Lists all available plugins
   */
  listPlugins() {
    console.log(this.colors.cyan + '\n🔌 Available Plugins:');
    console.log('='.repeat(40) + this.colors.reset);
    
    const plugins = this.pluginRegistry.getPlugins();
    if (plugins.length === 0) {
      console.log(`${this.colors.yellow}No plugins found.${this.colors.reset}`);
      return;
    }
    
    for (const plugin of plugins) {
      const status = plugin.loaded ? 
        `${this.colors.green}✅${this.colors.reset}` : 
        `${this.colors.red}❌${this.colors.reset}`;
      const language = plugin.language ? 
        `${this.colors.magenta}[${plugin.language}]${this.colors.reset}` : '';
      console.log(`${status} ${plugin.name.padEnd(20)} ${language} ${plugin.description}` + this.colors.reset);
      console.log(`${this.colors.gray}    Category: ${plugin.category}${this.colors.reset}`);
      console.log(`${this.colors.gray}    File: ${plugin.file}${this.colors.reset}`);
      console.log();
    }
  }

  /**
   * Shows detailed information about a specific plugin
   * @param {string} pluginName - Plugin name
   */
  async showPluginInfo(pluginName) {
    const plugin = this.pluginRegistry.getPlugin(pluginName);
    
    if (!plugin) {
      this.showError(`Plugin not found: ${pluginName}`);
      process.exit(1);
    }
    
    console.log(`${this.colors.cyan}\n🔌 Plugin: ${plugin.name}${this.colors.reset}`);
    console.log('='.repeat(40) + this.colors.reset);
    console.log(`Description: ${plugin.description}`);
    console.log(`Category: ${plugin.category}`);
    console.log(`Language: ${plugin.language || 'Generic'}`);
    console.log(`Version: ${plugin.version || '1.0.0'}`);
    console.log(`Author: ${plugin.author || 'Unknown'}`);
    console.log(`File: ${plugin.file}`);
    console.log(`Status: ${plugin.loaded ? 'Loaded' : 'Not loaded'}`);
    
    if (plugin.commands && plugin.commands.length > 0) {
      console.log(`${this.colors.yellow}\n📋 Commands:${this.colors.reset}`);
      for (const cmd of plugin.commands) {
        console.log(`   ${cmd.name.padEnd(15)} ${cmd.description}`);
      }
    }
    
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      console.log(`${this.colors.magenta}\n🔗 Dependencies:${this.colors.reset}`);
      for (const dep of plugin.dependencies) {
        console.log(`   - ${dep}`);
      }
    }
  }

  /**
   * Reloads all plugins
   */
  async reloadPlugins() {
    console.log(`${this.colors.yellow}🔄 Reloading plugins...${this.colors.reset}`);
    await this.pluginRegistry.discoverPlugins(true);
    this.showSuccess(`Reloaded ${this.pluginRegistry.getPluginCount()} plugins`);
  }
}

module.exports = PluginsCommand;
