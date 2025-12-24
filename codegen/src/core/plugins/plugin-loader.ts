/**
 * Plugin Loader - Discovers, loads, and manages plugins
 * AGENTS.md compliant: Plugin loading process with discovery, dependency resolution, loading, and validation
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import type { IPlugin } from '../interfaces/plugins/iplugin';
import type { IPluginRegistryManager } from '../interfaces/plugins/iplugin-registry-manager';
import type { IRegistryManager } from '../interfaces/registry/iregistry-manager';

/**
 * Plugin manifest structure
 */
interface PluginManifest {
  uuid: string;
  id: string;
  version: string;
  type: string;
  name: string;
  description: string;
  author: string;
  license: string;
  entry_point: string;
  spec_file: string;
  messages_file: string;
  dependencies: {
    core: string;
    plugins: string[];
  };
  platforms: Record<string, boolean>;
  registries: string[];
  capabilities: string[];
  tests: {
    directory: string;
    coverage_required: number;
  };
}

/**
 * Plugin Loader - Handles plugin discovery and loading
 * Follows AGENTS.md plugin loading process
 */
export class PluginLoader {
  private readonly pluginDir: string;
  private readonly registryManager: IRegistryManager;

  constructor(pluginDir: string, registryManager: IRegistryManager) {
    this.pluginDir = pluginDir;
    this.registryManager = registryManager;
  }

  /**
   * Load all plugins from plugin directory
   * Follows AGENTS.md plugin loading process
   */
  public async loadPlugins(): Promise<void> {
    console.log('🔌 Loading plugins...');

    // 1. Discovery Phase - scan plugin directory
    const pluginManifests = this.discoverPlugins();
    console.log(`📋 Discovered ${pluginManifests.length} plugin manifests`);

    // 2. Dependency Resolution - build dependency graph
    const loadOrder = this.resolveDependencies(pluginManifests);
    console.log(`🔗 Resolved dependency order for ${loadOrder.length} plugins`);

    // 3. Loading Phase - load plugins in dependency order
    const loadedPlugins: IPlugin[] = [];
    for (const manifest of loadOrder) {
      const plugin = await this.loadPlugin(manifest);
      loadedPlugins.push(plugin);
    }
    console.log(`📦 Loaded ${loadedPlugins.length} plugins`);

    // 4. Validation Phase - validate all plugins
    await this.validatePlugins(loadedPlugins);
    console.log('✅ Plugin validation completed');
  }

  /**
   * Discovery Phase - scan plugin directory for manifests
   */
  private discoverPlugins(): PluginManifest[] {
    const manifests: PluginManifest[] = [];
    const pluginTypes = ['languages', 'tools', 'templates', 'profiles', 'core'];

    for (const pluginType of pluginTypes) {
      const typeDir = join(this.pluginDir, pluginType);
      try {
        const entries = readdirSync(typeDir);

        for (const entry of entries) {
          const pluginPath = join(typeDir, entry);
          const stat = statSync(pluginPath);

          if (stat.isDirectory()) {
            const manifestPath = join(pluginPath, 'plugin.json');
            try {
              const manifestContent = readFileSync(manifestPath, 'utf-8');
              const manifest: PluginManifest = JSON.parse(manifestContent);
              manifests.push(manifest);
            } catch (error) {
              console.warn(`⚠️  Failed to load manifest for plugin ${entry}:`, error);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }

    return manifests;
  }

  /**
   * Dependency Resolution - topological sort based on dependencies
   * @param manifests
   */
  private resolveDependencies(manifests: PluginManifest[]): PluginManifest[] {
    const manifestMap = new Map<string, PluginManifest>();
    const dependencies = new Map<string, Set<string>>();
    const dependents = new Map<string, Set<string>>();

    // Build dependency maps
    for (const manifest of manifests) {
      manifestMap.set(manifest.id, manifest);
      dependencies.set(manifest.id, new Set(manifest.dependencies.plugins));
    }

    // Build dependents map
    for (const [id, deps] of dependencies) {
      for (const depId of deps) {
        if (!dependents.has(depId)) {
          dependents.set(depId, new Set());
        }
        dependents.get(depId)!.add(id);
      }
    }

    // Topological sort
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: PluginManifest[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) {
        return;
      }
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected: ${id}`);
      }

      visiting.add(id);

      // Visit dependencies first
      const deps = dependencies.get(id);
      if (deps) {
        for (const depId of deps) {
          visit(depId);
        }
      }

      visiting.delete(id);
      visited.add(id);
      const manifest = manifestMap.get(id);
      if (manifest) {
        order.push(manifest);
      }
    };

    // Visit all manifests
    for (const id of manifestMap.keys()) {
      visit(id);
    }

    return order;
  }

  /**
   * Loading Phase - load individual plugin
   * @param manifest
   */
  private async loadPlugin(manifest: PluginManifest): Promise<IPlugin> {
    const pluginPath = this.getPluginPath(manifest);
    const entryPoint = join(pluginPath, manifest.entry_point);

    try {
      // Dynamic import of plugin
      const pluginModule = await import(entryPoint);
      const PluginClass =
        pluginModule[manifest.name.replace(/\s+/g, '')] ||
        pluginModule.default ||
        pluginModule.Plugin;

      if (!PluginClass) {
        throw new Error(`Plugin class not found in ${entryPoint}`);
      }

      // Instantiate plugin
      const plugin: IPlugin = new PluginClass();

      // Register with appropriate registries
      await plugin.register(this.registryManager);

      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin ${manifest.id}: ${error}`);
    }
  }

  /**
   * Validation Phase - validate loaded plugins
   * @param plugins
   */
  private async validatePlugins(plugins: IPlugin[]): Promise<void> {
    const uuids = new Set<string>();
    const ids = new Set<string>();

    for (const plugin of plugins) {
      const spec = await plugin.getSpec();

      // Validate UUID uniqueness
      if (uuids.has(spec.uuid)) {
        throw new Error(`Duplicate UUID: ${spec.uuid}`);
      }
      uuids.add(spec.uuid);

      // Validate ID uniqueness
      if (ids.has(spec.id)) {
        throw new Error(`Duplicate ID: ${spec.id}`);
      }
      ids.add(spec.id);

      // Validate required capabilities
      if (!spec.capabilities || spec.capabilities.length === 0) {
        throw new Error(`Plugin ${spec.id} has no capabilities defined`);
      }

      // Validate spec completeness
      this.validateSpecCompleteness(spec);
    }
  }

  /**
   * Validate spec completeness
   * @param spec
   */
  private validateSpecCompleteness(spec: any): void {
    const requiredFields = ['uuid', 'id', 'type', 'search', 'capabilities'];

    for (const field of requiredFields) {
      if (!spec[field]) {
        throw new Error(`Plugin spec missing required field: ${field}`);
      }
    }

    // Validate search metadata
    if (!spec.search.title || !spec.search.summary) {
      throw new Error(`Plugin spec missing search metadata`);
    }
  }

  /**
   * Get plugin directory path from manifest
   * @param manifest
   */
  private getPluginPath(manifest: PluginManifest): string {
    // Extract plugin type from ID (e.g., 'plugin.language.typescript' -> 'languages')
    const idParts = manifest.id.split('.');
    let pluginType = 'tools'; // Default

    if (idParts.length >= 3) {
      switch (idParts[1]) {
        case 'language':
          pluginType = 'languages';
          break;
        case 'tool':
          pluginType = 'tools';
          break;
        case 'template':
          pluginType = 'templates';
          break;
        case 'profile':
          pluginType = 'profiles';
          break;
        case 'core':
          pluginType = 'core';
          break;
      }
    }

    return resolve(this.pluginDir, pluginType, manifest.name.toLowerCase().replace(/\s+/g, '-'));
  }
}
