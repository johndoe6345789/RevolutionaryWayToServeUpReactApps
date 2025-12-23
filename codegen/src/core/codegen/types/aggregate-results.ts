/**
 * Merged results produced by aggregate execution
 */
export interface AggregateResults {
  generated: string[];
  errors: string[];
  warnings: string[];
  stats: {
    pluginsExecuted: number;
    specsProcessed: number;
    filesGenerated: number;
    [key: string]: number;
  };
}
