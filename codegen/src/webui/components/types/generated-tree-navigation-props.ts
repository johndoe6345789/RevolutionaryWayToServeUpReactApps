import type { TreeNode } from './tree-node';

/**
 * Props passed to the generated tree navigation component.
 */
export interface GeneratedTreeNavigationProps {
  data: TreeNode[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId: string | undefined;
}
