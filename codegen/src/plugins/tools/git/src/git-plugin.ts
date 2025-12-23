/**
 * Git Tool Plugin - AGENTS.md compliant TypeScript implementation
 * Single responsibility: Git tool management with strict OO constraints
 */

import { IPluginConfig, IRegistryManager } from '../../../../core/interfaces/index';
import { BasePlugin } from '../../../../core/base-plugin';
import { execSync } from 'child_process';

export class GitPlugin extends BasePlugin {
  private installed = false;
  private verified = false;

  /**
   * Constructor with single config parameter
   * @param config - Plugin configuration
   */
  constructor(config: IPluginConfig) {
    super(config);
  }

  /**
   * Register Git tool with registries
   * @param registryManager - Registry manager instance
   */
  public override async register(registryManager: IRegistryManager): Promise<void> {
    await super.register(registryManager);
    registryManager.register('DevWorkflowRegistry', 'tool.dev.git', this);
  }

  /**
   * Execute Git operations (single business method)
   * @param context - Execution context
   * @returns Operation results
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    const operation = context.operation as string || 'verify';

    switch (operation) {
      case 'install':
        return this.installGit(context);
      case 'verify':
        return this.verifyGit(context);
      case 'execute':
        return this.executeGitCommand(context);
      case 'help':
        return this.getGitHelp(context);
      default:
        throw new Error(`Unknown Git operation: ${operation}`);
    }
  }

  /**
   * Install Git tool
   * @param context - Installation context
   * @returns Installation results
   */
  private installGit(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform;
    const packageManager = (context.packageManager as string) || this.detectPackageManager(platform);

    const spec = this.spec;
    if (!spec.install || !spec.install[platform]) {
      throw new Error(`Git installation not supported on platform: ${platform}`);
    }

    const installCommands = spec.install[platform][packageManager];
    if (!installCommands) {
      throw new Error(`Package manager ${packageManager} not supported for Git on ${platform}`);
    }

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
   * @param context - Verification context
   * @returns Verification results
   */
  private verifyGit(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform;

    const spec = this.spec;
    if (!spec.verify || !spec.verify[platform]) {
      throw new Error(`Git verification not supported on platform: ${platform}`);
    }

    const verifyCommand = spec.verify[platform];
    const output = execSync(verifyCommand.join(' '), { encoding: 'utf8' });

    this.verified = true;
    return {
      platform,
      command: verifyCommand,
      output: output.trim(),
      version: this.parseVersion(output),
      status: 'verified'
    };
  }

  /**
   * Execute Git command
   * @param context - Command context
   * @returns Command results
   */
  private executeGitCommand(context: Record<string, unknown>): unknown {
    const { command, args = [], cwd } = context;

    if (!command) {
      throw new Error('Git command not specified');
    }

    const fullCommand = ['git', command as string, ...(args as string[])];
    const execOptions: Record<string, unknown> = {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    };

    if (cwd) {
      execOptions.cwd = cwd;
    }

    try {
      const output = execSync(fullCommand.join(' '), { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, cwd: cwd as string });
      return {
        command: fullCommand,
        output: output.trim(),
        cwd: cwd || process.cwd(),
        status: 'executed'
      };
    } catch (error) {
      const execError = error as { message: string; status?: number };
      return {
        command: fullCommand,
        error: execError.message,
        exitCode: execError.status,
        cwd: cwd || process.cwd(),
        status: 'failed'
      };
    }
  }

  /**
   * Get Git help information
   * @param context - Help context
   * @returns Help information
   */
  private getGitHelp(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform;

    const spec = this.spec;
    if (!spec.help || !spec.help[platform]) {
      throw new Error(`Git help not available on platform: ${platform}`);
    }

    const helpCommand = spec.help[platform];
    const output = execSync(helpCommand.join(' '), { encoding: 'utf8' });

    return {
      platform,
      command: helpCommand,
      output: output.trim(),
      status: 'help_provided'
    };
  }

  /**
   * Detect appropriate package manager
   * @param platform - Target platform
   * @returns Package manager name
   */
  private detectPackageManager(platform: string): string {
    switch (platform) {
      case 'linux':
        return 'apt';
      case 'darwin':
        return 'brew';
      case 'win32':
        return 'choco';
      default:
        return 'apt';
    }
  }

  /**
   * Parse Git version from output
   * @param output - Version command output
   * @returns Parsed version
   */
  private parseVersion(output: string): string {
    const match = output.match(/git version (\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }
}
