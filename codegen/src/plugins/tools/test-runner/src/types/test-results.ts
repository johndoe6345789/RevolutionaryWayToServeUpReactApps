/**
 * TestResults - Summary of executed tests for the plugin.
 */
export interface TestResults {
  success: boolean;
  framework: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}
