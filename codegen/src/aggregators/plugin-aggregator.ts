/**
 * PluginAggregator - Manages plugin hierarchy with lifecycle management
 * Implements IStandardLifecycle for plugin discovery, loading, and navigation
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import type { IComponent } from '../core/interfaces/index';
import type { ISpec } from '../core/interfaces/ispec';
import type { IStandardLifecycle } from '../core/types/lifecycle';
import { LifecycleStatus } from '../core/types/lifecycle';

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
type PluginConstructor = new () => IComponent;

/**
 * PluginAggregator - Implements IStandardLifecycle
 * Manages plugin discovery, loading, and navigation
 */
export class PluginAggregator implements IStandardLifecycle {
  private readonly spec: ISpec;
  private readonly discoveredPlugins: Map<string, PluginInfo>;
  private readonly loadedPlugins: Map<string, IComponent>;
  private readonly children: Map<string, IComponent>;
  private currentStatus: LifecycleStatus;

  constructor(spec: ISpec) {
    this.spec = spec;
    this.discoveredPlugins = new Map();
    this.loadedPlugins = new Map();
    this.children = new Map();
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   * Initialise - Register with registry and prepare runtime state
   */
  public async initialise(): Promise<void> {
    this.currentStatus = LifecycleStatus.INITIALIZING;
    this._discoverPlugins();
    await this._loadPlugins();
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Validate - Pre-flight checks before execution
   */
  public async validate(): Promise<void> {
    this.currentStatus = LifecycleStatus.VALIDATING;
    // Validation logic would go here
    this.currentStatus = LifecycleStatus.READY;
  }

  /**
   * Execute - Primary operational method
   */
  public async execute(context: Record<string, unknown> = {}): Promise<unknown> {
    this.currentStatus = LifecycleStatus.EXECUTING;
    // Execute all loaded plugins
    for (const plugin of this.loadedPlugins.values()) {
      if (typeof plugin.execute === 'function') {
        await plugin.execute(context);
      }
    }
    this.currentStatus = LifecycleStatus.READY;
    return { success: true, pluginsExecuted: this.loadedPlugins.size };
  }

  /**
   * Cleanup - Resource cleanup and shutdown
   */
  public async cleanup(): Promise<void> {
    this.currentStatus = LifecycleStatus.CLEANING;
    // Cleanup all plugins
    for (const plugin of this.loadedPlugins.values()) {
      if ('cleanup' in plugin && typeof plugin.cleanup === 'function') {
        await plugin.cleanup();
      }
    }
    this.children.clear();
    this.currentStatus = LifecycleStatus.DESTROYED;
  }

  /**
   * Debug - Return diagnostic information
   */
  public debug(): Record<string, unknown> {
    return {
      spec: this.spec,
      status: this.currentStatus,
      discoveredPlugins: Array.from(this.discoveredPlugins.keys()),
      loadedPlugins: Array.from(this.loadedPlugins.keys()),
      children: Array.from(this.children.keys()),
    };
  }

  /**
   * Reset - State reset for testing
   */
  public async reset(): Promise<void> {
    await this.cleanup();
    this.discoveredPlugins.clear();
    this.loadedPlugins.clear();
    this.currentStatus = LifecycleStatus.UNINITIALIZED;
  }

  /**
   * Status - Return current lifecycle state
   */
  public status(): LifecycleStatus {
    return this.currentStatus;
  }

  /**
   *
   */
  private _discoverPlugins(): void {
    const pluginsDir = path.join(__dirname, '../plugins'),
      categories = ['tools', 'languages', 'templates', 'profiles'];

    for (const category of categories) {
      const categoryDir = path.join(pluginsDir, category);

      if (!fs.existsSync(categoryDir)) {
        continue;
      }

      const items = fs.readdirSync(categoryDir);

      for (const item of items) {
        const pluginDir = path.join(categoryDir, item),
          manifestPath = path.join(pluginDir, 'plugin.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<
                string,
                unknown
              >,
              pluginId = manifest.id;
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
        const entryPoint = path.join(pluginInfo.path, pluginInfo.entry_point),
          PluginClass = require(entryPoint) as PluginConstructor;
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
