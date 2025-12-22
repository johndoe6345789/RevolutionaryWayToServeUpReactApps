/**
 * Languages Command
 * Manages language detection and information
 */

const BaseCommand = require('./base-command');

class LanguagesCommand extends BaseCommand {
  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    return 'languages';
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    return 'Manage language detection';
  }

  /**
   * Executes languages command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    const subCommand = args[0] || 'list';
    
    switch (subCommand) {
      case 'list':
        await this.listLanguages();
        break;
        
      case 'detect':
        await this.detectAndShowLanguages();
        break;
        
      case 'info':
        await this.showLanguageInfo(args[1]);
        break;
        
      default:
        this.showError(`Unknown languages command: ${subCommand}`);
        console.log(`${this.colors.yellow}Available: list, detect, info${this.colors.reset}`);
        process.exit(1);
    }
  }

  /**
   * Lists all supported languages
   */
  async listLanguages() {
    console.log(this.colors.cyan + '\n🌍 Supported Languages:');
    console.log('='.repeat(40) + this.colors.reset);
    
    const languages = this.languageRegistry.getSupportedLanguages();
    if (languages.length === 0) {
      console.log(`${this.colors.yellow}No languages found.${this.colors.reset}`);
      return;
    }
    
    for (const language of languages) {
      const status = language.detected ? 
        `${this.colors.green}✅${this.colors.reset}` : 
        `${this.colors.white}⚪${this.colors.reset}`;
      console.log(`${status} ${language.name.padEnd(15)} ${language.description}` + this.colors.reset);
      console.log(`${this.colors.gray}    Extensions: ${language.fileExtensions.join(', ')}${this.colors.reset}`);
      console.log(`${this.colors.gray}    Project Files: ${language.projectFiles.join(', ')}${this.colors.reset}`);
      console.log();
    }
  }

  /**
   * Detects and shows languages for current project
   */
  async detectAndShowLanguages() {
    console.log(this.colors.cyan + '\n🔍 Detecting Project Languages...');
    console.log('='.repeat(40) + this.colors.reset);
    
    const detectedLanguages = await this.languageRegistry.detectLanguages(this.projectPath);
    
    if (detectedLanguages.length === 0) {
      console.log(`${this.colors.yellow}No specific languages detected in this project.${this.colors.reset}`);
      return;
    }
    
    console.log(`${this.colors.green}Detected ${detectedLanguages.length} language(s):${this.colors.reset}`);
    for (const language of detectedLanguages) {
      console.log(`${this.colors.white}  📍 ${language}${this.colors.reset}`);
    }
  }

  /**
   * Shows detailed information about a specific language
   * @param {string} languageName - Language name
   */
  async showLanguageInfo(languageName) {
    const language = this.languageRegistry.getLanguage(languageName);
    
    if (!language) {
      this.showError(`Language not found: ${languageName}`);
      console.log(`${this.colors.yellow}Use "dev-cli languages list" to see available languages${this.colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${this.colors.cyan}\n🌍 Language: ${language.name}${this.colors.reset}`);
    console.log('='.repeat(40) + this.colors.reset);
    console.log(`Description: ${language.description}`);
    console.log(`Extensions: ${language.fileExtensions.join(', ')}`);
    console.log(`Project Files: ${language.projectFiles.join(', ')}`);
    console.log(`Detected: ${language.detected ? 'Yes' : 'No'}`);
    
    const plugins = this.pluginRegistry.getPluginsByLanguage(language.name);
    if (plugins.length > 0) {
      console.log(`${this.colors.yellow}\n🔌 Available Plugins:${this.colors.reset}`);
      for (const plugin of plugins) {
        console.log(`   ${plugin.name.padEnd(20)} ${plugin.description}`);
      }
    }
  }
}

module.exports = LanguagesCommand;
