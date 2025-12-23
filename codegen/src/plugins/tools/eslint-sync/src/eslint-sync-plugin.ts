/**
 * ESLint Sync Plugin - AGENTS.md compliant TypeScript implementation
 * Single responsibility: Synchronize ESLint configurations across project subdirectories
 */

import type { IPluginConfig, IRegistryManager } from '../../../../core/interfaces/index';
import { BasePlugin } from '../../../../core/base-plugin';
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 *
 */
export class ESLintSyncPlugin extends BasePlugin {
  private verified = false;
  private readonly standardConfigs = {
    base: {
      extends: ['@eslint/js'],
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prettier/prettier': 'error',
        'no-console': 'off',
        'no-undef': 'off',
      },
      overrides: [
        {
          files: ['**/*.ts', '**/*.tsx'],
          rules: {
            'max-lines': ['error', 300],
          },
        },
      ],
    },
    strict: {
      extends: ['@eslint/js', 'next/core-web-vitals'],
      plugins: ['@typescript-eslint', 'prettier', 'react-hooks'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        'prettier/prettier': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'no-console': 'error',
      },
      overrides: [
        {
          files: ['**/*.ts', '**/*.tsx'],
          rules: {
            'max-lines': ['error', 300],
          },
        },
      ],
    },
    test: {
      extends: ['@eslint/js'],
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'prettier/prettier': 'error',
        'no-console': 'off',
      },
      overrides: [
        {
          files: ['**/*.ts', '**/*.tsx'],
          rules: {
            'max-lines': ['error', 300],
          },
        },
      ],
    },
  };

  /**
   * Constructor with single config parameter
   * @param config - Plugin configuration
   */
  constructor(config: IPluginConfig) {
    super(config);
    // Override the base path to point to plugin root directory
    (this as any).specLoader =
      new (require('../../../../core/plugin-spec-loader').PluginSpecLoader)(join(__dirname, '..'));
    (this as any).messageLoader =
      new (require('../../../../core/plugin-message-loader').PluginMessageLoader)(
        join(__dirname, '..'),
      );
  }

  /**
   * Register ESLint Sync tool with registries
   * @param registryManager - Registry manager instance
   */
  public override async register(registryManager: IRegistryManager): Promise<void> {
    // Initialize first to load the spec with proper UUID
    await this.initializePlugin();
    registryManager.register('DevWorkflowRegistry', 'tool.dev.eslint-sync', this);
  }

  /**
   * Execute ESLint sync operations (single business method)
   * @param context - Execution context
   * @returns Sync results
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    const operation = (context.operation as string) || 'sync';

    switch (operation) {
      case 'sync':
        return this.executeSync(context);
      case 'validate':
        return this.executeValidate(context);
      case 'generate':
        return this.executeGenerate(context);
      case 'diff':
        return this.executeDiff(context);
      case 'verify':
        return this.verifySync(context);
      case 'help':
        return this.getSyncHelp(context);
      default:
        throw new Error(`Unknown ESLint sync operation: ${operation}`);
    }
  }

  /**
   * Execute sync operation
   * @param context - Sync context
   * @returns Sync results
   */
  private executeSync(context: Record<string, unknown>): unknown {
    const { scope = 'all', level = 'auto', dryRun = false, force = false, backup = true } = context,
      projects = this.discoverProjects(scope as string),
      results: { project: string; synced: boolean; error?: string }[] = [];

    for (const project of projects) {
      try {
        const synced = this.syncProjectConfig(
          project,
          level as string,
          Boolean(dryRun),
          Boolean(force),
          Boolean(backup),
        );
        results.push({ project, synced });
      } catch (error) {
        results.push({
          project,
          synced: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'sync',
      scope,
      level,
      dryRun,
      force,
      backup,
      results,
      summary: this.generateSummary(results),
      status: 'completed',
    };
  }

  /**
   * Execute validate operation
   * @param context - Validate context
   * @returns Validation results
   */
  private executeValidate(context: Record<string, unknown>): unknown {
    const { scope = 'all' } = context,
      projects = this.discoverProjects(scope as string),
      results: { project: string; valid: boolean; issues?: string[] }[] = [];

    for (const project of projects) {
      try {
        const validation = this.validateProjectConfig(project);
        results.push({ project, ...validation });
      } catch (error) {
        results.push({
          project,
          valid: false,
          issues: [(error as Error).message],
        });
      }
    }

    return {
      operation: 'validate',
      scope,
      results,
      summary: this.generateValidationSummary(results),
      status: 'completed',
    };
  }

  /**
   * Execute generate operation
   * @param context - Generate context
   * @returns Generation results
   */
  private executeGenerate(context: Record<string, unknown>): unknown {
    const { scope = 'all', level = 'base', dryRun = false, force = false } = context,
      projects = this.discoverProjects(scope as string),
      results: { project: string; generated: boolean; error?: string }[] = [];

    for (const project of projects) {
      try {
        const generated = this.generateProjectConfig(
          project,
          level as string,
          Boolean(dryRun),
          Boolean(force),
        );
        results.push({ project, generated });
      } catch (error) {
        results.push({
          project,
          generated: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'generate',
      scope,
      level,
      dryRun,
      force,
      results,
      summary: this.generateSummary(results),
      status: 'completed',
    };
  }

  /**
   * Execute diff operation
   * @param context - Diff context
   * @returns Diff results
   */
  private executeDiff(context: Record<string, unknown>): unknown {
    const { scope = 'all', level = 'auto' } = context,
      projects = this.discoverProjects(scope as string),
      results: { project: string; differences?: string[]; error?: string }[] = [];

    for (const project of projects) {
      try {
        const differences = this.diffProjectConfig(project, level as string);
        results.push({ project, differences });
      } catch (error) {
        results.push({
          project,
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'diff',
      scope,
      level,
      results,
      status: 'completed',
    };
  }

  /**
   * Discover projects with ESLint configurations
   * @param scope - Scope specification
   * @returns Array of project paths
   */
  private discoverProjects(scope: string): string[] {
    const rootDir = resolve(process.cwd()),
      projects: string[] = [];

    if (scope === 'all') {
      // Find all directories that might have ESLint configs
      const items = readdirSync(rootDir);
      for (const item of items) {
        const fullPath = join(rootDir, item);
        if (statSync(fullPath).isDirectory() && this.hasPackageJson(fullPath)) {
          projects.push(item);
        }
      }
    } else {
      // Specific projects
      const scopes = scope.split(',').map((s) => s.trim());
      projects.push(...scopes);
    }

    return projects;
  }

  /**
   * Check if directory has package.json
   * @param dirPath - Directory path
   * @returns Whether package.json exists
   */
  private hasPackageJson(dirPath: string): boolean {
    return existsSync(join(dirPath, 'package.json'));
  }

  /**
   * Sync ESLint configuration for a project
   * @param project - Project name
   * @param level - Configuration level
   * @param dryRun - Whether to perform dry run
   * @param force - Whether to force operation
   * @param backup - Whether to create backups
   * @returns Whether config was synced
   */
  private syncProjectConfig(
    project: string,
    level: string,
    dryRun: boolean,
    force: boolean,
    backup: boolean,
  ): boolean {
    const projectPath = resolve(process.cwd(), project),
      configPath = this.findESLintConfig(projectPath);

    if (!configPath) {
      // No existing config, generate new one
      return this.generateProjectConfig(project, level, dryRun, force);
    }

    // Determine target level if auto
    const targetLevel = level === 'auto' ? this.detectProjectLevel(project) : level,
      standardConfig = this.standardConfigs[targetLevel as keyof typeof this.standardConfigs];

    if (!standardConfig) {
      throw new Error(`Unknown configuration level: ${targetLevel}`);
    }

    if (backup && !dryRun) {
      this.createBackup(configPath);
    }

    if (dryRun) {
      console.log(`Would sync ${project} to ${targetLevel} level`);
      return true;
    }

    // Read existing config
    const existingConfig = this.readESLintConfig(configPath),
      // Merge with standard config (keeping project-specific overrides)
      syncedConfig = this.mergeConfigs(standardConfig, existingConfig);

    // Write back
    this.writeESLintConfig(configPath, syncedConfig);

    return true;
  }

  /**
   * Validate ESLint configuration for a project
   * @param project - Project name
   * @returns Validation result
   */
  private validateProjectConfig(project: string): { valid: boolean; issues?: string[] } {
    const projectPath = resolve(process.cwd(), project),
      configPath = this.findESLintConfig(projectPath);

    if (!configPath) {
      return { valid: false, issues: ['No ESLint configuration found'] };
    }

    try {
      const config = this.readESLintConfig(configPath),
        issues: string[] = [];

      // Basic validation
      if (!config.rules) {
        issues.push('Missing rules section');
      }

      if (!config.extends && !config.plugins) {
        issues.push('Missing extends or plugins section');
      }

      const result: { valid: boolean; issues?: string[] } = {
        valid: issues.length === 0,
      };

      if (issues.length > 0) {
        result.issues = issues;
      }

      return result;
    } catch (error) {
      return {
        valid: false,
        issues: [(error as Error).message],
      };
    }
  }

  /**
   * Generate ESLint configuration for a project
   * @param project - Project name
   * @param level - Configuration level
   * @param dryRun - Whether to perform dry run
   * @param force - Whether to force operation
   * @returns Whether config was generated
   */
  private generateProjectConfig(
    project: string,
    level: string,
    dryRun: boolean,
    force: boolean,
  ): boolean {
    const projectPath = resolve(process.cwd(), project),
      configPath = join(projectPath, 'eslint.config.js');

    if (existsSync(configPath) && !force) {
      throw new Error(`ESLint config already exists at ${configPath}. Use --force to overwrite.`);
    }

    const targetLevel = level === 'auto' ? this.detectProjectLevel(project) : level,
      standardConfig = this.standardConfigs[targetLevel as keyof typeof this.standardConfigs];

    if (!standardConfig) {
      throw new Error(`Unknown configuration level: ${targetLevel}`);
    }

    if (dryRun) {
      console.log(`Would generate ${targetLevel} level config for ${project}`);
      return true;
    }

    // Generate project-specific config
    const config = this.generateProjectSpecificConfig(project, standardConfig);

    this.writeESLintConfig(configPath, config);
    return true;
  }

  /**
   * Show differences for a project configuration
   * @param project - Project name
   * @param level - Target level
   * @returns Array of differences
   */
  private diffProjectConfig(project: string, level: string): string[] {
    const projectPath = resolve(process.cwd(), project),
      configPath = this.findESLintConfig(projectPath);

    if (!configPath) {
      return [`No ESLint configuration found for ${project}`];
    }

    const targetLevel = level === 'auto' ? this.detectProjectLevel(project) : level,
      standardConfig = this.standardConfigs[targetLevel as keyof typeof this.standardConfigs],
      existingConfig = this.readESLintConfig(configPath);

    return this.compareConfigs(existingConfig, standardConfig);
  }

  /**
   * Detect appropriate configuration level for a project
   * @param project - Project name
   * @returns Detected level
   */
  private detectProjectLevel(project: string): string {
    // Simple heuristics based on project name and structure
    if (project.includes('test') || project.includes('e2e')) {
      return 'test';
    }

    const projectPath = resolve(process.cwd(), project),
      packageJsonPath = join(projectPath, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')),
          deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.next) {
          return 'strict';
        }

        if (deps.react) {
          return 'strict';
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    return 'base';
  }

  /**
   * Find ESLint configuration file in project
   * @param projectPath - Project path
   * @returns Config file path or null
   */
  private findESLintConfig(projectPath: string): string | null {
    const configNames = ['eslint.config.js', 'eslint.config.mjs', '.eslintrc.js', '.eslintrc.json'];

    for (const configName of configNames) {
      const configPath = join(projectPath, configName);
      if (existsSync(configPath)) {
        return configPath;
      }
    }

    return null;
  }

  /**
   * Read ESLint configuration from file
   * @param configPath - Configuration file path
   * @returns Parsed configuration
   */
  private readESLintConfig(configPath: string): any {
    const ext = configPath.split('.').pop();

    if (ext === 'js' || ext === 'mjs') {
      // For JS files, we'd need to evaluate them, but for simplicity we'll assume JSON-like structure
      // In a real implementation, you'd use a proper ESLint config parser
      throw new Error('JS config parsing not implemented in this demo');
    }

    return JSON.parse(readFileSync(configPath, 'utf8'));
  }

  /**
   * Write ESLint configuration to file
   * @param configPath - Configuration file path
   * @param config - Configuration object
   */
  private writeESLintConfig(configPath: string, config: any): void {
    const ext = configPath.split('.').pop();
    let content: string;

    if (ext === 'js') {
      content = `export default ${JSON.stringify(config, null, 2)};`;
    } else {
      content = JSON.stringify(config, null, 2);
    }

    writeFileSync(configPath, content, 'utf8');
  }

  /**
   * Merge standard config with existing config
   * @param standard - Standard configuration
   * @param existing - Existing configuration
   * @returns Merged configuration
   */
  private mergeConfigs(standard: any, existing: any): any {
    // Simple merge - in practice, you'd want more sophisticated merging
    const merged = {
      ...standard,
      ...existing,
      rules: {
        ...standard.rules,
        ...existing.rules,
      },
    };

    // Merge overrides if they exist
    if (standard.overrides || existing.overrides) {
      merged.overrides = [...(standard.overrides || []), ...(existing.overrides || [])];
    }

    return merged;
  }

  /**
   * Generate project-specific configuration
   * @param project - Project name
   * @param baseConfig - Base configuration
   * @returns Project-specific configuration
   */
  private generateProjectSpecificConfig(project: string, baseConfig: any): any {
    const projectPath = resolve(process.cwd(), project),
      // Add project-specific settings
      config = { ...baseConfig };

    // Add file patterns based on project type
    if (project.includes('test') || project.includes('e2e')) {
      config.files = ['**/*.ts', '**/*.js'];
      // Relax rules for tests
      config.rules = {
        ...config.rules,
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      };
    } else if (this.detectProjectLevel(project) === 'strict') {
      config.files = ['**/*.ts', '**/*.tsx'];
      // Add React-specific globals
      config.languageOptions = {
        ...config.languageOptions,
        globals: {
          React: 'readonly',
          JSX: 'readonly',
        },
      };
    } else {
      config.files = ['**/*.ts', '**/*.js'];
    }

    return config;
  }

  /**
   * Compare two configurations
   * @param config1 - First configuration
   * @param config2 - Second configuration
   * @returns Array of differences
   */
  private compareConfigs(config1: any, config2: any): string[] {
    const differences: string[] = [],
      // Simple comparison - in practice, you'd want deep diffing
      keys1 = Object.keys(config1),
      keys2 = Object.keys(config2);

    for (const key of keys2) {
      if (!(key in config1)) {
        differences.push(`Missing ${key} in current config`);
      }
    }

    return differences;
  }

  /**
   * Create backup of configuration file
   * @param configPath - Configuration file path
   */
  private createBackup(configPath: string): void {
    const backupPath = `${configPath}.backup.${Date.now()}`;
    copyFileSync(configPath, backupPath);
    console.log(`Backup created: ${backupPath}`);
  }

  /**
   * Verify ESLint sync tool availability
   * @param context - Verification context
   * @returns Verification results
   */
  private verifySync(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform,
      { spec } = this;
    if (!spec.verify?.[platform]) {
      throw new Error(`ESLint sync verification not supported on platform: ${platform}`);
    }

    // Basic verification - check if we can read/write files
    try {
      const testPath = resolve(process.cwd(), 'test-eslint-sync.tmp');
      writeFileSync(testPath, 'test', 'utf8');
      // Clean up
      require('fs').unlinkSync(testPath);
      this.verified = true;

      return {
        platform,
        command: spec.verify[platform],
        capabilities: ['read', 'write', 'sync', 'validate'],
        status: 'verified',
      };
    } catch (error) {
      return {
        platform,
        command: spec.verify[platform],
        error: (error as Error).message,
        status: 'failed',
      };
    }
  }

  /**
   * Get ESLint sync help information
   * @param context - Help context
   * @returns Help information
   */
  private getSyncHelp(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform,
      { spec } = this;
    if (!spec.help?.[platform]) {
      throw new Error(`ESLint sync help not available on platform: ${platform}`);
    }

    return {
      platform,
      command: spec.help[platform],
      description: 'Synchronize ESLint configurations across project subdirectories',
      availableOperations: [
        'sync - Sync all ESLint configurations',
        'validate - Validate configuration consistency',
        'generate - Generate missing configurations',
        'diff - Show configuration differences',
      ],
      configurationLevels: {
        base: 'Essential rules for Node.js/TypeScript projects',
        strict: 'Full TypeScript strictness + React rules',
        test: 'Relaxed rules for test files',
        auto: 'Auto-detect based on project structure',
      },
      options: {
        '--dry-run': 'Preview changes without applying them',
        '--force': 'Force operations without confirmation',
        '--scope': 'Specify projects to sync (default: all)',
        '--level': 'Specify configuration strictness level',
        '--backup': 'Create backups before making changes',
      },
      status: 'help_provided',
    };
  }

  /**
   * Generate summary for sync/generate operations
   * @param results - Operation results
   * @returns Summary string
   */
  private generateSummary(results: Record<string, boolean | string>[]): string {
    const successful = results.filter((r) => r.synced || r.generated).length,
      failed = results.filter((r) => !(r.synced || r.generated)).length;

    let summary = `Processed ${results.length} projects`;
    if (successful > 0) {
      summary += `, ${successful} successful`;
    }
    if (failed > 0) {
      summary += `, ${failed} failed`;
    }

    return summary;
  }

  /**
   * Generate summary for validation operations
   * @param results - Validation results
   * @returns Summary string
   */
  private generateValidationSummary(results: { valid: boolean; issues?: string[] }[]): string {
    const valid = results.filter((r) => r.valid).length,
      invalid = results.filter((r) => !r.valid).length,
      totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);

    let summary = `Validated ${results.length} configurations`;
    if (valid > 0) {
      summary += `, ${valid} valid`;
    }
    if (invalid > 0) {
      summary += `, ${invalid} invalid`;
    }
    if (totalIssues > 0) {
      summary += `, ${totalIssues} issues found`;
    }

    return summary;
  }
}
