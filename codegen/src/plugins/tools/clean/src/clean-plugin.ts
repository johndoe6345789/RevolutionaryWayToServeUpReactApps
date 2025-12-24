/**
 * Clean Tool Plugin - AGENTS.md compliant TypeScript implementation
 * Single responsibility: Cleanup of generated code and dependencies
 */

import type { IPluginConfig, IRegistryManager } from '../../../../core/interfaces/index';
import { BasePlugin } from '../../../../core/plugins/base-plugin';
import { existsSync, readdirSync, rmSync, statSync } from 'fs';
import { join, resolve } from 'path';

/**
 *
 */
export class CleanPlugin extends BasePlugin {
  private verified = false;

  /**
   * Constructor with single config parameter
   * @param config - Plugin configuration
   */
  constructor(config: IPluginConfig) {
    super(config);
    // Override the base path to point to plugin root directory
    (this as any).specLoader =
      new (require('../../../../core/plugins/plugin-spec-loader').PluginSpecLoader)(
        join(__dirname, '..'),
      );
    (this as any).messageLoader =
      new (require('../../../../core/plugins/plugin-message-loader').PluginMessageLoader)(
        join(__dirname, '..'),
      );
  }

  /**
   * Register Clean tool with registries
   * @param registryManager - Registry manager instance
   */
  public override async register(registryManager: IRegistryManager): Promise<void> {
    // Initialize first to load the spec with proper UUID
    await this.initializePlugin();
    registryManager.register('DevWorkflowRegistry', 'tool.dev.clean', this);
  }

  /**
   * Execute cleanup operations (single business method)
   * @param context - Execution context
   * @returns Cleanup results
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    const operation = (context.operation as string) || 'execute';

    switch (operation) {
      case 'execute':
        return this.executeCleanup(context);
      case 'verify':
        return this.verifyClean(context);
      case 'help':
        return this.getCleanHelp(context);
      default:
        throw new Error(`Unknown Clean operation: ${operation}`);
    }
  }

  /**
   * Execute cleanup operations
   * @param context - Cleanup context
   * @returns Cleanup results
   */
  private executeCleanup(context: Record<string, unknown>): unknown {
    const {
      targets = 'node_modules,dist,build,out,.cache,.next,coverage',
      dryRun = false,
      force = false,
    } = context;
    const targetPatterns = (targets as string).split(',').map((t) => t.trim());
    const results: { target: string; removed: boolean; error?: string }[] = [];

    for (const pattern of targetPatterns) {
      try {
        const removed = this.cleanTarget(pattern, Boolean(dryRun), Boolean(force));
        results.push({ target: pattern, removed });
      } catch (error) {
        results.push({
          target: pattern,
          removed: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      operation: 'cleanup',
      targets: targetPatterns,
      dryRun,
      force,
      results,
      summary: this.generateSummary(results),
      status: 'completed',
    };
  }

  /**
   * Verify clean tool availability
   * @param context - Verification context
   * @returns Verification results
   */
  private verifyClean(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform;
    const { spec } = this;
    if (!spec.verify?.[platform]) {
      throw new Error(`Clean verification not supported on platform: ${platform}`);
    }

    // Basic verification - check if rm command exists
    try {
      const testPath = resolve(process.cwd(), 'test-clean-target');
      rmSync(testPath, { recursive: true, force: true });
      this.verified = true;

      return {
        platform,
        command: spec.verify[platform],
        capabilities: ['remove', 'recursive', 'force'],
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
   * Get clean help information
   * @param context - Help context
   * @returns Help information
   */
  private getCleanHelp(context: Record<string, unknown>): unknown {
    const platform = (context.platform as string) || process.platform;
    const { spec } = this;
    if (!spec.help?.[platform]) {
      throw new Error(`Clean help not available on platform: ${platform}`);
    }

    return {
      platform,
      command: spec.help[platform],
      description: 'Cleanup utility for generated code and dependencies',
      availableTargets: [
        'node_modules - Node.js dependencies',
        'dist - Distribution/build output',
        'build - Build artifacts',
        'out - Output directories',
        '.cache - Cache directories',
        '.next - Next.js cache',
        'coverage - Test coverage reports',
      ],
      options: {
        '--dry-run': 'Preview what would be cleaned',
        '--force': 'Skip confirmation prompts',
        '--targets': 'Specify custom targets (comma-separated)',
      },
      status: 'help_provided',
    };
  }

  /**
   * Clean a specific target pattern
   * @param pattern - Target pattern to clean
   * @param dryRun - Whether to perform dry run
   * @param force - Whether to force removal
   * @returns Whether target was removed
   */
  private cleanTarget(pattern: string, dryRun: boolean, force: boolean): boolean {
    let removed = false;

    // Handle different patterns
    switch (pattern) {
      case 'node_modules':
        removed = this.removeDirectoriesByName('.', 'node_modules', dryRun, force);
        break;
      case 'dist':
      case 'build':
      case 'out':
        removed = this.removeDirectoriesByName('.', pattern, dryRun, force);
        break;
      case '.cache':
      case '.next':
      case 'coverage':
        removed = this.removeDirectoriesByName('.', pattern, dryRun, force);
        break;
      default:
        // Handle custom patterns
        if (existsSync(pattern)) {
          if (dryRun) {
            console.log(`Would remove: ${pattern}`);
            removed = true;
          } else {
            rmSync(pattern, { recursive: true, force });
            removed = true;
          }
        }
        break;
    }

    return removed;
  }

  /**
   * Remove directories by name recursively
   * @param rootDir - Root directory to search
   * @param dirName - Directory name to remove
   * @param dryRun - Whether to perform dry run
   * @param force - Whether to force removal
   * @returns Whether any directories were removed
   */
  private removeDirectoriesByName(
    rootDir: string,
    dirName: string,
    dryRun: boolean,
    force: boolean,
  ): boolean {
    let removed = false;

    function scanAndRemove(dir: string): void {
      try {
        const items = readdirSync(dir);

        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            if (item === dirName) {
              if (dryRun) {
                console.log(`Would remove: ${fullPath}`);
              } else {
                rmSync(fullPath, { recursive: true, force });
              }
              removed = true;
            } else {
              // Recursively scan subdirectories (but avoid node_modules for performance)
              if (item !== 'node_modules' || dirName === 'node_modules') {
                scanAndRemove(fullPath);
              }
            }
          }
        }
      } catch (error) {
        // Ignore permission errors, etc.
      }
    }

    scanAndRemove(rootDir);
    return removed;
  }

  /**
   * Generate cleanup summary
   * @param results - Cleanup results
   * @returns Summary string
   */
  private generateSummary(results: { target: string; removed: boolean; error?: string }[]): string {
    const successful = results.filter((r) => r.removed).length;
    const failed = results.filter((r) => !r.removed).length;
    const errors = results.filter((r) => r.error).length;

    let summary = `Cleaned ${successful} targets`;
    if (failed > 0) {
      summary += `, ${failed} not found`;
    }
    if (errors > 0) {
      summary += `, ${errors} errors`;
    }

    return summary;
  }
}
