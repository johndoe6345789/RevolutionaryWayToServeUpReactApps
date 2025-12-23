/**
 * Generated code result - output of code generation
 */
export interface GeneratedCode {
  /** Generated code content as array of lines */
  content: string[];
  /** File extension for the generated code */
  extension: string;
  /** Generation metadata */
  metadata: {
    /** Target language */
    language: string;
    /** Template used */
    template: string;
    /** Generation timestamp */
    generatedAt: string;
    /** Variables used in generation */
    variables: string[];
  };
}
