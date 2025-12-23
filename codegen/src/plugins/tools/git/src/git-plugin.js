#!/usr/bin/env node

/**
 * Git Tool Plugin
 * Implements Git tool management following AGENTS.md specifications
 * Enforces strict OO principles with single business method
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BasePlugin = require('../../../../core/base-plugin');

class GitPlugin extends BasePlugin {
  constructor(config = {}) {
    // Single constructor parameter - config dataclass
    super({
      name: 'git',
      description: 'Git version control system plugin',
      version: '1.0.0',
      author: 'Codegen Team',
      category: 'tool',
      dependencies: [],
      keywords: ['git', 'version-control', 'vcs'],
      capabilities: ['install', 'verify', 'execute'],
      ...config
    });

    // Plugin-specific state
    this.installed = false;
    this.verified = false;
  }

  /**
   * Load plugin specification from spec.json
   * @returns {Promise<void>}
   */
  async _loadSpec() {
    try {
      const specPath = path.join(__dirname, '../spec.json');
      if (fs.existsSync(specPath)) {
        const specData = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        this.spec = specData;
      } else {
        // Fallback to generated spec
        await super._loadSpec();
      }
    } catch (error) {
      this.log(`Failed to load Git plugin spec: ${error.message}`, 'warning');
      await super._loadSpec();
    }
  }

  /**
   * Load plugin messages from messages.json
   * @returns {Promise<void>}
   */
  async _loadMessages() {
    try {
      const messagesPath = path.join(__dirname, '../messages.json');
      if (fs.existsSync(messagesPath)) {
        this.messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
      } else {
        // Fallback to base implementation
        await super._loadMessages();
      }
    } catch (error) {
      this.log(`Failed to load Git plugin messages: ${error.message}`, 'warning');
      await super._loadMessages();
    }
  }

  /**
   * Register Git tool with appropriate registries
   * @param {Object} registryManager - Registry manager instance
   * @returns {Promise<void>}
   */
  async _registerComponents(registryManager) {
    // Register Git tool in DevWorkflowRegistry
    registryManager.register('DevWorkflowRegistry', 'tool.dev.git', this.spec);
  }

  /**
   * Execute Git tool operations
   * Single business method per AGENTS.md OO requirements
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution results
   */
  async _executePlugin(context) {
    const results = {
      success: false,
      operation: context.operation || 'verify',
      output: null,
      error: null,
      timestamp: new Date().toISOString()
    };

    try {
      switch (context.operation) {
        case 'install':
          results.output = await this._installGit(context);
          break;
        case 'verify':
          results.output = await this._verifyGit(context);
          break;
        case 'execute':
          results.output = await this._executeGitCommand(context);
          break;
        case 'help':
          results.output = await this._getGitHelp(context);
          break;
        default:
          throw new Error(`Unknown Git operation: ${context.operation}`);
      }

      results.success = true;
    } catch (error) {
      results.error = error.message;
      results.success = false;
    }

    return results;
  }

  /**
   * Install Git tool
   * @param {Object} context - Installation context
   * @returns {Promise<Object>} Installation results
   */
  async _installGit(context) {
    const platform = context.platform || process.platform;
    const packageManager = context.packageManager || this._detectPackageManager(platform);

    if (!this.spec || !this.spec.install || !this.spec.install[platform]) {
      throw new Error(`Git installation not supported on platform: ${platform}`);
    }

    const installCommands = this.spec.install[platform][packageManager];
    if (!installCommands) {
      throw new Error(`Package manager ${packageManager} not supported for Git on ${platform}`);
    }

    // Execute installation command
    const command = installCommands.join(' ');
    execSync(command, { stdio: 'inherit' });

    this.installed = true;

    return {
      platform,
      packageManager,
      command,
      status: 'installed'
    };
  }

  /**
   * Verify Git installation
   * @param {Object} context - Verification context
   * @returns {Promise<Object>} Verification results
   */
  async _verifyGit(context) {
    const platform = context.platform || process.platform;

    if (!this.spec || !this.spec.verify || !this.spec.verify[platform]) {
      throw new Error(`Git verification not supported on platform: ${platform}`);
    }

    const verifyCommand = this.spec.verify[platform];
    const output = execSync(verifyCommand.join(' '), { encoding: 'utf8' });

    this.verified = true;

    return {
      platform,
      command: verifyCommand,
      output: output.trim(),
      version: this._parseVersion(output),
      status: 'verified'
    };
  }

  /**
   * Execute Git command
   * @param {Object} context - Command execution context
   * @returns {Promise<Object>} Command execution results
   */
  async _executeGitCommand(context) {
    const { command, args = [], cwd } = context;

    if (!command) {
      throw new Error('Git command not specified');
    }

    // Build full command
    const fullCommand = ['git', command, ...args];
    const execOptions = {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    };

    if (cwd) {
      execOptions.cwd = cwd;
    }

    try {
      const output = execSync(fullCommand.join(' '), execOptions);

      return {
        command: fullCommand,
        output: output.trim(),
        cwd: cwd || process.cwd(),
        status: 'executed'
      };
    } catch (error) {
      // Git commands can fail for legitimate reasons (e.g., no changes to commit)
      // Return error info rather than throwing
      return {
        command: fullCommand,
        error: error.message,
        exitCode: error.status,
        cwd: cwd || process.cwd(),
        status: 'failed'
      };
    }
  }

  /**
   * Get Git help information
   * @param {Object} context - Help context
   * @returns {Promise<Object>} Help information
   */
  async _getGitHelp(context) {
    const platform = context.platform || process.platform;

    if (!this.spec || !this.spec.help || !this.spec.help[platform]) {
      throw new Error(`Git help not available on platform: ${platform}`);
    }

    const helpCommand = this.spec.help[platform];
    const output = execSync(helpCommand.join(' '), { encoding: 'utf8' });

    return {
      platform,
      command: helpCommand,
      output: output.trim(),
      status: 'help_provided'
    };
  }

  /**
   * Detect appropriate package manager for platform
   * @param {string} platform - Target platform
   * @returns {string} Package manager name
   */
  _detectPackageManager(platform) {
    // Simple detection - could be enhanced
    switch (platform) {
      case 'linux':
        return 'apt'; // Default to apt, could detect others
      case 'darwin':
        return 'brew';
      case 'win32':
        return 'choco'; // Default to choco, could detect winget
      default:
        return 'apt';
    }
  }

  /**
   * Parse Git version from output
   * @param {string} output - Git version command output
   * @returns {string} Parsed version
   */
  _parseVersion(output) {
    const match = output.match(/git version (\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get one-liner commands for Git
   * @returns {Array<Object>} Available one-liners
   */
  getOneLiners() {
    return this.spec?.oneLiners || [];
  }

  /**
   * Get Git tool options
   * @returns {Array<Object>} Available options
   */
  getOptions() {
    return this.spec?.options || [];
  }

  /**
   * Check if Git has network-related risks
   * @returns {boolean} True if network operations are risky
   */
  hasNetworkRisk() {
    return this.spec?.risks?.network || false;
  }

  /**
   * Check if Git has destructive operation risks
   * @returns {boolean} True if destructive operations are possible
   */
  hasDestructiveRisk() {
    return this.spec?.risks?.destructive || false;
  }
}

module.exports = GitPlugin;
