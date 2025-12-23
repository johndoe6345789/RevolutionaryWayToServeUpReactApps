/**
 * A node that can be rendered inside the generated tree navigation.
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
