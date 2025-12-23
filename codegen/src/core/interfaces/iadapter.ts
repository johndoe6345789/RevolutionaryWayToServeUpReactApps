/**
 * Adapter interface - boundary layer for I/O operations
 * AGENTS.md compliant: mediates all external interactions (filesystem, network, shell)
 */
export interface IAdapter {
  /**
   *
   */
  execute(
    command: readonly string[],
    options?: { cwd?: string; env?: Record<string, string> }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  /**
   *
   */
  readFile(path: string): Promise<string>;
  /**
   *
   */
  writeFile(path: string, content: string): Promise<void>;
  /**
   *
   */
  exists(path: string): Promise<boolean>;
}
