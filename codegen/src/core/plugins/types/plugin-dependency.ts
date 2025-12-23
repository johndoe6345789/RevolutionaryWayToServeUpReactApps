import type { PluginManifest } from './plugin-manifest';

/**
 * PluginDependency - Runtime representation of a plugin and its relationships.
 */
export interface PluginDependency {
  pluginId: string;
  manifest: PluginManifest;
  entryPath: string;
  dependencies: string[];
}
