/**
 * PluginManifest - Shape of plugin.json descriptors.
 */
export interface PluginManifest {
  id: string;
  name?: string;
  version?: string;
  entry_point: string;
  dependencies?: string[] | { core?: string; plugins?: string[] };
  [key: string]: unknown;
}
