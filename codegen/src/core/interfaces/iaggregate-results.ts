/**
 * Aggregate results interface
 * Results from aggregate execution operations
 */

/**
 *
 */
export interface IAggregateResults {
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
