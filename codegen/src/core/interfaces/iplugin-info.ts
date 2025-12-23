/**
 * Plugin info interface
 * Information about discovered plugins
 */

/**
 *
 */
export interface IPluginInfo {
  id: string;
  name?: string;
  version?: string;
  entry_point: string;
  path?: string;
  category?: string;
  [key: string]: unknown;
}
