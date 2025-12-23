/**
 * ExecutionResults - Summary of a single code generation run.
 */
export interface ExecutionResults {
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
