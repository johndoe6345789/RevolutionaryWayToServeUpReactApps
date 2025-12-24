#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PluginDependencyLinter {
  pluginsDir;
  discoveredPlugins = new Map();

  constructor(pluginsDir = path.join(__dirname, '../plugins')) {
    this.pluginsDir = pluginsDir;
  }

  extractDependencies(deps) {
    if (!deps) {
      return [];
    }

    if (Array.isArray(deps)) {
      return deps;
    }

    const result = [];
    if (deps.plugins) {
      result.push(...deps.plugins);
    }
    return result;
  }

  async analyze() {
    this.discoveredPlugins.clear();
    this.discoverPlugins();

    const circularDeps = this.detectCircularDependencies();
    const warnings = this.validateDependencies();

    return {
      success: circularDeps.length === 0,
      circularDeps,
      warnings,
      pluginCount: this.discoveredPlugins.size,
    };
  }

  discoverPlugins() {
    const categories = ['tools', 'languages', 'templates', 'profiles'];

    for (const category of categories) {
      const categoryDir = path.join(this.pluginsDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const items = fs.readdirSync(categoryDir);

      for (const item of items) {
        const pluginDir = path.join(categoryDir, item);
        const manifestPath = path.join(pluginDir, 'plugin.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const entryPath = path.join(pluginDir, manifest.entry_point);

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

  detectCircularDependencies() {
    const circularDeps = [];
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (pluginId, currentPath) => {
      if (recursionStack.has(pluginId)) {
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

  validateDependencies() {
    const warnings = [];

    for (const [pluginId, plugin] of this.discoveredPlugins) {
      for (const depId of plugin.dependencies) {
        if (!this.discoveredPlugins.has(depId)) {
          warnings.push(`Plugin '${pluginId}' depends on unknown plugin '${depId}'`);
        }
      }

      if (!fs.existsSync(plugin.entryPath)) {
        warnings.push(`Plugin '${pluginId}' entry point '${plugin.entryPath}' does not exist`);
      }

      if (plugin.dependencies.includes(pluginId)) {
        warnings.push(`Plugin '${pluginId}' has self-dependency`);
      }
    }

    return warnings;
  }

  getDependencyGraph() {
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

  getPluginInfo() {
    return Array.from(this.discoveredPlugins.values()).map((plugin) => ({
      id: plugin.pluginId,
      dependencies: plugin.dependencies,
      entryPoint: plugin.entryPath,
    }));
  }
}

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
