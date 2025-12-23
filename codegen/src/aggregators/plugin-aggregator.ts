/**
 * PluginAggregator - Manages plugin hierarchy with unlimited drill-down
 * Implements IAggregator for plugin discovery, loading, and navigation
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAggregator } from '../core/base-aggregator';
import type { IComponent } from '../core/interfaces/index';
import type { ISpec } from '../core/interfaces/ispec';

/**
 *
 */
interface PluginInfo {
  id: string;
  name?: string;
  version?: string;
  entry_point?: string;
  path?: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * Interface for plugin constructors
 */
interface PluginConstructor {
  new (): IComponent;
}

/**
 *
 */
export class PluginAggregator extends BaseAggregator {
  private readonly discoveredPlugins: Map<string, PluginInfo>;
  private readonly loadedPlugins: Map<string, IComponent>;

  constructor(spec: ISpec) {
    super(spec);
    this.discoveredPlugins = new Map();
    this.loadedPlugins = new Map();
  }

  /**
   * @returns Promise<PluginAggregator> Initialised aggregator
   */
  public override async initialise(): Promise<PluginAggregator> {
    await super.initialise();
    this._discoverPlugins();
    await this._loadPlugins();
    return this;
  }

  /**
   * @param context Execution context
   * @returns Promise<unknown> Execution result
   */
  public override async execute(context: Record<string, unknown>): Promise<unknown> {
    await super.execute(context);
    // Execute all loaded plugins
    for (const plugin of this.loadedPlugins.values()) {
      if (typeof plugin.execute === 'function') {
        await plugin.execute(context);
      }
    }
    return { success: true, pluginsExecuted: this.loadedPlugins.size };
  }

  /**
   *
   */
  public override async shutdown(): Promise<void> {
    // Shutdown all plugins
    for (const plugin of this.loadedPlugins.values()) {
      if ('shutdown' in plugin && typeof plugin.shutdown === 'function') {
        await (plugin.shutdown as () => Promise<void>)();
      }
    }
    await super.shutdown();
  }

  /**
   *
   */
  private _discoverPlugins(): void {
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
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<
              string,
              unknown
            >;
            const pluginId = manifest.id;
            if (typeof pluginId === 'string') {
              this.discoveredPlugins.set(pluginId, {
                ...(manifest as PluginInfo),
                path: pluginDir,
                category,
              });
            }
          } catch {
            // Skip invalid manifests
          }
        }
      }
    }
  }

  /**
   *
   */
  private async _loadPlugins(): Promise<void> {
    for (const [pluginId, pluginInfo] of this.discoveredPlugins) {
      try {
        if (
          pluginInfo.path == null ||
          pluginInfo.entry_point == null ||
          pluginInfo.entry_point === ''
        ) {
          continue; // Skip plugins without valid path or entry point
        }
        const entryPoint = path.join(pluginInfo.path, pluginInfo.entry_point);
        const PluginClass = require(entryPoint) as PluginConstructor;
        if (typeof PluginClass !== 'function') {
          continue; // Skip invalid plugin classes
        }
        const plugin = new PluginClass();

        if (typeof plugin.initialise === 'function') {
          await plugin.initialise();
        }

        this.loadedPlugins.set(pluginId, plugin);
        this.children.set(pluginId, plugin);
      } catch {
        // Skip failed plugin loads
      }
    }
  }
}
