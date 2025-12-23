/**
 * Results returned after analyzing OOP principles
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
