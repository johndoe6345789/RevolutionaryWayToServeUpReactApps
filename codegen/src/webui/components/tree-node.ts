/**
 * TreeNode - Represents an item in the generated navigation tree.
 */
export interface TreeNode {
  id: string;
  name: string;
  type: 'aggregate' | 'registry' | 'component' | 'tool' | 'profile';
  children?: TreeNode[];
  metadata?: {
    count?: number;
    status?: string;
    domain?: string;
  };
}
