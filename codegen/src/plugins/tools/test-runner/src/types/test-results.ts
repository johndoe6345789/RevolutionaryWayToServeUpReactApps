/**
 * Test execution results
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
