/**
 * Git Hooks Management Plugin - AGENTS.md compliant TypeScript implementation
 * Single responsibility: Centralized Git hooks management and deployment
 */

import type { IPluginConfig, IRegistryManager } from '../../../../core/interfaces/index';
import { BasePlugin } from '../../../../core/base-plugin';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 *
 */
interface HookTemplate {
  description: string;
  template: string;
  executable: boolean;
}

/**
 *
 */
export class GitHooksPlugin extends BasePlugin {
  private readonly hooksPath = '.git/hooks';
  private readonly templatesPath = 'templates.json';
  private installed = false;
  private readonly verified = false;
  private templates: Record<string, string[]> = {};

  /**
   * Constructor with single config parameter
   * @param config - Plugin configuration
   */
  constructor(config: IPluginConfig) {
    super(config);
    this.loadTemplates();
  }

  /**
   * Register Git hooks tool with registries
   * @param registryManager - Registry manager instance
   */
  public override async register(registryManager: IRegistryManager): Promise<void> {
    await super.register(registryManager);
    registryManager.register('DevWorkflowRegistry', 'tool.dev.git-hooks', this);
  }

  /**
   * Execute Git hooks operations (single business method)
   * @param context - Execution context
   * @returns Operation results
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    const operation = (context.operation as string) || 'list';

    switch (operation) {
      case 'install':
        return this.installGit(context);
      case 'setup':
        return this.setupHooks(context);
      case 'verify':
        return this.verifyHooks(context);
      case 'list':
        return this.listHooks(context);
      case 'create':
        return this.createHook(context);
      case 'remove':
        return this.removeHook(context);
      default:
        throw new Error(`Unknown Git hooks operation: ${operation}`);
    }
  }

  /**
   * Install Git tool (dependency for hooks)
   * @param context - Installation context
   * @returns Installation results
   */
  private installGit(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform,
      packageManager = (context.packageManager as string) || this.detectPackageManager(platform),
      { spec } = this;
    if (!spec.install?.[platform]) {
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
      status: 'installed',
    };
  }

  /**
   * Setup hooks from templates
   * @param context - Setup context
   * @returns Setup results
   */
  private setupHooks(context: Record<string, unknown>): unknown {
    const hooksToSetup = (context.hooks as string[]) || Object.keys(this.getHookTemplates()),
      results: Record<string, unknown>[] = [];

    this.ensureHooksDirectory();

    for (const hookName of hooksToSetup) {
      try {
        const result = this.installHook(hookName, context);
        results.push(result);
      } catch (error) {
        results.push({
          hook: hookName,
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'setup',
      hooks: results,
      total: results.length,
      successful: results.filter((r) => r.status === 'installed').length,
      failed: results.filter((r) => r.status === 'failed').length,
    };
  }

  /**
   * Verify hooks installation
   * @param context - Verification context
   * @returns Verification results
   */
  private verifyHooks(context: Record<string, unknown>): unknown {
    const hooksToVerify = (context.hooks as string[]) || Object.keys(this.getHookTemplates()),
      results: Record<string, unknown>[] = [];

    for (const hookName of hooksToVerify) {
      const hookPath = path.join(this.hooksPath, hookName),
        exists = fs.existsSync(hookPath),
        executable = exists ? this.isExecutable(hookPath) : false;

      results.push({
        hook: hookName,
        path: hookPath,
        exists,
        executable,
        status: exists && executable ? 'verified' : exists ? 'not_executable' : 'missing',
      });
    }

    const verifiedCount = results.filter((r) => r.status === 'verified').length;

    return {
      operation: 'verify',
      hooks: results,
      total: results.length,
      verified: verifiedCount,
      issues: results.length - verifiedCount,
      status: verifiedCount === results.length ? 'all_verified' : 'issues_found',
    };
  }

  /**
   * List available hooks and templates
   * @param context - List context
   * @returns List results
   */
  private listHooks(context: Record<string, unknown>): unknown {
    const templates = this.getHookTemplates(),
      installed: Record<string, unknown>[] = [],
      available: Record<string, unknown>[] = [];

    // Check installed hooks
    for (const hookName of Object.keys(templates)) {
      const hookPath = path.join(this.hooksPath, hookName),
        exists = fs.existsSync(hookPath),
        executable = exists ? this.isExecutable(hookPath) : false;

      if (exists) {
        installed.push({
          name: hookName,
          path: hookPath,
          executable,
          template: templates[hookName],
        });
      } else {
        available.push({
          name: hookName,
          template: templates[hookName],
        });
      }
    }

    return {
      operation: 'list',
      installed: {
        count: installed.length,
        hooks: installed,
      },
      available: {
        count: available.length,
        hooks: available,
      },
      templates: Object.keys(templates).length,
    };
  }

  /**
   * Create a new hook from template
   * @param context - Create context
   * @returns Create results
   */
  private createHook(context: Record<string, unknown>): unknown {
    const hookName = context.hook as string,
      templateName = (context.template as string) || hookName;

    if (!hookName) {
      throw new Error('Hook name is required');
    }

    return this.installHook(hookName, { template: templateName, ...context });
  }

  /**
   * Remove installed hooks
   * @param context - Remove context
   * @returns Remove results
   */
  private removeHook(context: Record<string, unknown>): unknown {
    const hooksToRemove = (context.hooks as string[]) || [],
      results: Record<string, unknown>[] = [];

    for (const hookName of hooksToRemove) {
      try {
        const hookPath = path.join(this.hooksPath, hookName),
          backupPath = `${hookPath}.backup`;

        if (fs.existsSync(hookPath)) {
          // Create backup
          fs.copyFileSync(hookPath, backupPath);
          fs.unlinkSync(hookPath);

          results.push({
            hook: hookName,
            status: 'removed',
            backup: backupPath,
          });
        } else {
          results.push({
            hook: hookName,
            status: 'not_found',
          });
        }
      } catch (error) {
        results.push({
          hook: hookName,
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'remove',
      hooks: results,
      total: results.length,
      removed: results.filter((r) => r.status === 'removed').length,
      failed: results.filter((r) => r.status === 'failed').length,
    };
  }

  /**
   * Install a specific hook from template
   * @param hookName - Name of the hook
   * @param context - Installation context
   * @returns Installation result
   */
  private installHook(hookName: string, context: Record<string, unknown>): unknown {
    const templates = this.getHookTemplates(),
      templateName = (context.template as string) || hookName,
      template = templates[templateName];

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const hookPath = path.join(this.hooksPath, hookName),
      // Read template content
      templateContent = this.getTemplateContent(template.template, context);

    // Write hook file
    fs.writeFileSync(hookPath, templateContent, { mode: 0o755 });

    if (template.executable) {
      fs.chmodSync(hookPath, 0o755);
    }

    return {
      hook: hookName,
      template: templateName,
      path: hookPath,
      executable: template.executable,
      status: 'installed',
    };
  }

  /**
   * Load templates from JSON file
   */
  private loadTemplates(): void {
    try {
      // In test environment, use the current directory
      const pluginDir =
          this.config.entry_point && typeof this.config.entry_point === 'string'
            ? path.dirname(this.config.entry_point.replace('src/git-hooks-plugin.js', ''))
            : __dirname.replace('/src', ''),
        templatesFile = path.join(pluginDir, this.templatesPath);

      if (fs.existsSync(templatesFile)) {
        const templatesData = fs.readFileSync(templatesFile, 'utf8');
        this.templates = JSON.parse(templatesData);
      } else {
        // Fallback: try relative to current file
        const fallbackPath = path.join(__dirname, '..', this.templatesPath);
        if (fs.existsSync(fallbackPath)) {
          const templatesData = fs.readFileSync(fallbackPath, 'utf8');
          this.templates = JSON.parse(templatesData);
        }
      }
    } catch (error) {
      console.warn('Failed to load templates:', error);
    }
  }

  /**
   * Get hook templates from spec
   * @returns Hook templates
   */
  private getHookTemplates(): Record<string, HookTemplate> {
    const spec = this.spec as any;
    return spec.hookTemplates || {};
  }

  /**
   * Get template content with variable substitution
   * @param templateName - Name of the template (e.g., 'pre-commit')
   * @param context - Context for variable substitution
   * @returns Template content
   */
  private getTemplateContent(templateName: string, context: Record<string, unknown>): string {
    // Extract template name from path if it's a full path
    const baseName = templateName.replace('templates/', '').replace('.sh', ''),
      templateLines = this.templates[baseName];
    if (templateLines && Array.isArray(templateLines)) {
      return templateLines.join('\n');
    }

    // Fallback for unknown templates
    return `#!/bin/sh
# Generic hook template for ${baseName}

echo "Hook executed: ${baseName}"
`;
  }

  /**
   * Ensure hooks directory exists
   */
  private ensureHooksDirectory(): void {
    if (!fs.existsSync(this.hooksPath)) {
      fs.mkdirSync(this.hooksPath, { recursive: true });
    }
  }

  /**
   * Check if file is executable
   * @param filePath - Path to file
   * @returns True if executable
   */
  private isExecutable(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return Boolean(stats.mode & 0o111);
    } catch {
      return false;
    }
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
}
