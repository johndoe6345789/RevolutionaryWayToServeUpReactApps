/**
 * ExecutionResults - Internal execution summary for the test runner.
 */
export interface ExecutionResults {
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}
