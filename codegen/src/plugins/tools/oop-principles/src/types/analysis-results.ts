/**
 * AnalysisResults - Output from the OOP principles analysis run.
 */
export interface AnalysisResults {
  success: boolean;
  violations: string[];
  summary: {
    analyzed: number;
    compliant: number;
    violations: number;
  };
}
