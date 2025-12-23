/**
 * AggregateResults - Combined outcomes across all executed plugins and specs.
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
