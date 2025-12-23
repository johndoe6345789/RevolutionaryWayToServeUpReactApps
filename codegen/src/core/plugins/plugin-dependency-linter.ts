#!/usr/bin/env bun

/**
 * PluginDependencyLinter - Custom dependency analyzer for AGENTS.md plugin system
 * Detects circular dependencies in dynamically loaded plugins
 * Analyzes plugin manifests and entry point dependencies
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 *
 */
interface PluginManifest {
  id: string;
  name?: string;
  version?: string;
  entry_point: string;
  dependencies?: string[] | { core?: string; plugins?: string[] };
  [key: string]: unknown;
}

/**
 *
 */
interface PluginDependency {
  pluginId: string;
  manifest: PluginManifest;
  entryPath: string;
  dependencies: string[];
}

/**
 *
 */
export class PluginDependencyLinter {
  private readonly pluginsDir: string;
  private readonly discoveredPlugins = new Map<string, PluginDependency>();

  constructor(pluginsDir = path.join(__dirname, '../plugins')) {
    this.pluginsDir = pluginsDir;
  }

  /**
   * Extract dependencies from manifest format
   * @param deps
   */
  private extractDependencies(deps?: string[] | { core?: string; plugins?: string[] }): string[] {
    if (!deps) {
      return [];
    }

    if (Array.isArray(deps)) {
      return deps;
    }

    // Handle object format
    const result: string[] = [];
    if (deps.plugins) {
      result.push(...deps.plugins);
    }
    return result;
  }

  /**
   * Analyze all plugins for circular dependencies
   */
  public async analyze(): Promise<{
    success: boolean;
    circularDeps: string[][];
    warnings: string[];
    pluginCount: number;
  }> {
    this.discoveredPlugins.clear();

    // Discover all plugins
    this.discoverPlugins();

    // Analyze dependencies
    const circularDeps = this.detectCircularDependencies(),
      warnings = this.validateDependencies();

    return {
      success: circularDeps.length === 0,
      circularDeps,
      warnings,
      pluginCount: this.discoveredPlugins.size,
    };
  }

  /**
   * Discover all plugins from filesystem
   */
  private discoverPlugins(): void {
    const categories = ['tools', 'languages', 'templates', 'profiles'];

    for (const category of categories) {
      const categoryDir = path.join(this.pluginsDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const items = fs.readdirSync(categoryDir);

      for (const item of items) {
        const pluginDir = path.join(categoryDir, item),
          manifestPath = path.join(pluginDir, 'plugin.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PluginManifest,
              entryPath = path.join(pluginDir, manifest.entry_point);

            this.discoveredPlugins.set(manifest.id, {
              pluginId: manifest.id,
              manifest,
              entryPath,
              dependencies: this.extractDependencies(manifest.dependencies),
            });
          } catch {
            // Skip invalid manifests
          }
        }
      }
    }
  }

  /**
   * Detect circular dependencies using DFS
   */
  private detectCircularDependencies(): string[][] {
    const circularDeps: string[][] = [],
      visited = new Set<string>(),
      recursionStack = new Set<string>(),
      dfs = (pluginId: string, currentPath: string[]): boolean => {
        if (recursionStack.has(pluginId)) {
          // Found cycle
          const cycleStart = currentPath.indexOf(pluginId);
          circularDeps.push([...currentPath.slice(cycleStart), pluginId]);
          return true;
        }

        if (visited.has(pluginId)) {
          return false;
        }

        visited.add(pluginId);
        recursionStack.add(pluginId);

        const plugin = this.discoveredPlugins.get(pluginId);
        if (plugin) {
          for (const depId of plugin.dependencies) {
            if (dfs(depId, [...currentPath, pluginId])) {
              return true;
            }
          }
        }

        recursionStack.delete(pluginId);
        return false;
      };

    for (const pluginId of this.discoveredPlugins.keys()) {
      if (!visited.has(pluginId)) {
        dfs(pluginId, []);
      }
    }

    return circularDeps;
  }

  /**
   * Validate dependency declarations
   */
  private validateDependencies(): string[] {
    const warnings: string[] = [];

    for (const [pluginId, plugin] of this.discoveredPlugins) {
      // Check if dependencies exist
      for (const depId of plugin.dependencies) {
        if (!this.discoveredPlugins.has(depId)) {
          warnings.push(`Plugin '${pluginId}' depends on unknown plugin '${depId}'`);
        }
      }

      // Check if entry point exists
      if (!fs.existsSync(plugin.entryPath)) {
        warnings.push(`Plugin '${pluginId}' entry point '${plugin.entryPath}' does not exist`);
      }

      // Check for self-dependency
      if (plugin.dependencies.includes(pluginId)) {
        warnings.push(`Plugin '${pluginId}' has self-dependency`);
      }
    }

    return warnings;
  }

  /**
   * Get dependency graph as DOT format for visualization
   */
  public getDependencyGraph(): string {
    let dot = 'digraph PluginDependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';

    for (const [pluginId, plugin] of this.discoveredPlugins) {
      for (const depId of plugin.dependencies) {
        dot += `  "${pluginId}" -> "${depId}";\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Get plugin information
   */
  public getPluginInfo(): {
    id: string;
    dependencies: string[];
    entryPoint: string;
  }[] {
    return Array.from(this.discoveredPlugins.values()).map((plugin) => ({
      id: plugin.pluginId,
      dependencies: plugin.dependencies,
      entryPoint: plugin.entryPath,
    }));
  }
}

// CLI interface
if (import.meta.main) {
  const linter = new PluginDependencyLinter();

  linter
    .analyze()
    .then((result) => {
      console.log(`🔍 Analyzed ${result.pluginCount} plugins\n`);

      if (result.success) {
        console.log('✅ No circular dependencies found!');
      } else {
        console.log('❌ Circular dependencies detected:');
        result.circularDeps.forEach((cycle, index) => {
          console.log(`  ${index + 1}. ${cycle.join(' → ')}`);
        });
        process.exit(1);
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach((warning) => {
          console.log(`  - ${warning}`);
        });
      }

      // Optional: output DOT graph
      if (process.argv.includes('--graph')) {
        console.log('\n📊 Dependency Graph (DOT format):');
        console.log(linter.getDependencyGraph());
      }
    })
    .catch((error) => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}
