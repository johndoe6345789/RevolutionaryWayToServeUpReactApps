/**
 * Codegen execution results interface
 * Results from codegen execution operations
 */

/**
 *
 */
export interface ICodegenExecutionResults {
  success: boolean;
  generated: string[];
  errors: string[];
  warnings: string[];
  timestamp: string;
  stats: {
    pluginsExecuted: number;
    specsProcessed: number;
    filesGenerated: number;
    [key: string]: number;
  };
}
