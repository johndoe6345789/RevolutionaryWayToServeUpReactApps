/**
 * Plugin configuration interface
 * AGENTS.md compliant: plugin metadata with dependencies and capabilities
 */
export interface IPluginConfig {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly category: string;
  readonly dependencies?: readonly string[];
  readonly keywords?: readonly string[];
  readonly capabilities?: readonly string[];
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly domain?: string;
  readonly [key: string]: unknown;
}
