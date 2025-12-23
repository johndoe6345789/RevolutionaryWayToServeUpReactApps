/**
 * Summary results from executing the test suite
 */
export interface ExecutionResults {
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}
