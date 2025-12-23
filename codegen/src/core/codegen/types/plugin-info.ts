/**
 * Metadata collected for discovered plugins
 */
export interface PluginInfo {
  id: string;
  name: string | undefined;
  version: string | undefined;
  entry_point: string;
  path: string;
  category: string;
  [key: string]: unknown;
}
