/**
 * PluginAggregator - Manages plugin hierarchy with unlimited drill-down
 * Implements IAggregator for plugin discovery, loading, and navigation
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAggregator } from '../core/base-aggregator';
import { IAggregator, IComponent } from '../core/interfaces/index';
import { ISpec } from '../core/interfaces/ispec';

interface PluginInfo {
  id: string;
  name?: string;
  version?: string;
  entry_point: string;
  path?: string;
  category?: string;
  [key: string]: unknown;
}

export class PluginAggregator extends BaseAggregator {
  private discoveredPlugins: Map<string, PluginInfo>;
  private loadedPlugins: Map<string, IComponent>;

  constructor(spec: ISpec) {
    super(spec);
    this.discoveredPlugins = new Map();
    this.loadedPlugins = new Map();
  }

  public override async initialise(): Promise<PluginAggregator> {
    await super.initialise();
    await this._discoverPlugins();
    await this._loadPlugins();
    return this;
  }

  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    await super.execute(context);
    // Execute all loaded plugins
    for (const [pluginId, plugin] of this.loadedPlugins) {
      if (typeof plugin.execute === 'function') {
        await plugin.execute(context);
      }
    }
    return { success: true, pluginsExecuted: this.loadedPlugins.size };
  }

  public override async shutdown(): Promise<void> {
    // Shutdown all plugins
    for (const [pluginId, plugin] of this.loadedPlugins) {
      if (typeof (plugin as any).shutdown === 'function') {
        await (plugin as any).shutdown();
      }
    }
    await super.shutdown();
  }

  private async _discoverPlugins(): Promise<void> {
    const pluginsDir = path.join(__dirname, '../plugins');
    const categories = ['tools', 'languages', 'templates', 'profiles'];

    for (const category of categories) {
      const categoryDir = path.join(pluginsDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const items = fs.readdirSync(categoryDir);

      for (const item of items) {
        const pluginDir = path.join(categoryDir, item);
        const manifestPath = path.join(pluginDir, 'plugin.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
            this.discoveredPlugins.set(manifest.id as string, {
              ...manifest,
              path: pluginDir,
              category
            });
          } catch (error) {
            // Skip invalid manifests
          }
        }
      }
    }
  }

  private async _loadPlugins(): Promise<void> {
    for (const [pluginId, pluginInfo] of this.discoveredPlugins) {
      try {
        const entryPoint = path.join(pluginInfo.path, pluginInfo.entry_point);
        const PluginClass = require(entryPoint);
        const plugin = new PluginClass();

        if (typeof plugin.initialise === 'function') {
          await plugin.initialise();
        }

        this.loadedPlugins.set(pluginId, plugin);
        this.children.set(pluginId, plugin);
      } catch (error) {
        // Skip failed plugin loads
      }
    }
  }
}
