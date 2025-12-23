/**
 * PluginInfo - Captures metadata discovered for each plugin.
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
