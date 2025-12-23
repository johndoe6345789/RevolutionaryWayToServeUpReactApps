/**
 * ExecutorState - Tracks the detected testing framework and test counts.
 */
export interface ExecutorState {
  framework: string;
  testsRun: number;
}
