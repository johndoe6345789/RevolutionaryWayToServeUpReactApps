import type { PluginManifest } from './plugin-manifest';

/**
 * Resolved plugin dependency record
 */
export interface PluginDependency {
  pluginId: string;
  manifest: PluginManifest;
  entryPath: string;
  dependencies: string[];
}
