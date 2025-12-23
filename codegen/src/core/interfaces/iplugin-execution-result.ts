/**
 * Plugin execution result interface - standardizes plugin execution outcomes
 * AGENTS.md compliant: provides consistent result structure for plugin operations
 */

/**
 *
 */
export interface IPluginExecutionResult {
  success: boolean;
  plugin: string;
  timestamp: string;
  output: Record<string, unknown>;
}
