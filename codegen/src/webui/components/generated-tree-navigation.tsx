/**
 * Generated Tree Navigation
 *
 * Hierarchical tree view of aggregates with expand/collapse functionality
 *
 * Auto-generated from spec.json
 */
/* eslint-disable max-lines-per-function, sort-imports */

import { Description as DescriptionIcon, Folder as FolderIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import React, { useState } from 'react';
import type { GeneratedTreeNavigationProps } from './types/generated-tree-navigation-props';
import type { TreeNode } from './types/tree-node';

const hasChildNodes = (node: TreeNode): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

const nodeIcon = ({ hasChildren }: { hasChildren: boolean }): React.ReactElement => {
  if (hasChildren) {
    return <FolderIcon />;
  }
  return <DescriptionIcon />;
};

const nodeCountChip = ({ count }: { count?: number }): React.ReactElement | null => {
  if (typeof count !== 'number') {
    return null;
  }
  return <Chip label={count} size="small" sx={{ marginLeft: 1 }} />;
};

const nodeDomainChip = ({ domain }: { domain?: string }): React.ReactElement | null => {
  if (domain === '' || typeof domain === 'undefined') {
    return null;
  }
  return <Chip label={domain} size="small" variant="outlined" sx={{ marginLeft: 1 }} />;
};

const treeNodeLabel = (node: TreeNode): React.ReactElement => (
  <Box sx={{ alignItems: 'center', display: 'flex', padding: 0.5 }}>
    {nodeIcon({ hasChildren: hasChildNodes(node) })}
    <Typography variant="body2" sx={{ marginLeft: 1 }}>
      {node.name}
    </Typography>
    {node.metadata?.count !== undefined && nodeCountChip({ count: node.metadata.count })}
    {node.metadata?.domain !== undefined && nodeDomainChip({ domain: node.metadata.domain })}
  </Box>
);

const treeNodeItem = (node: TreeNode): React.ReactElement => (
  <TreeItem key={node.id} itemId={node.id} label={treeNodeLabel(node)}>
    {(node.children ?? []).map((child) => treeNodeItem(child))}
  </TreeItem>
);

/**
 * Stateless tree navigation that renders the aggregated registry hierarchy.
 *
 * @param props Component props.
 * @param props.data The tree data to render.
 * @param props.onNodeSelect Callback invoked when a node is selected.
 * @param props.selectedNodeId Currently selected node id.
 * @returns The rendered navigation component.
 */
const generatedTreeNavigation = ({
  data,
  onNodeSelect,
  selectedNodeId,
}: GeneratedTreeNavigationProps): React.ReactElement => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleExpansionChange = (_event: React.SyntheticEvent | null, nodeIds: string[]): void => {
    setExpanded(nodeIds);
  };

  const handleSelectionChange = (
    _event: React.SyntheticEvent | null,
    itemId: string | null,
  ): void => {
    if (typeof itemId === 'string') {
      onNodeSelect?.(itemId);
    }
  };

  return (
    <Paper sx={{ height: '100%', overflow: 'auto', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Registry Navigation
      </Typography>
      <SimpleTreeView
        aria-label="registry navigator"
        expandedItems={expanded}
        onExpandedItemsChange={handleExpansionChange}
        selectedItems={selectedNodeId ?? null}
        onSelectedItemsChange={handleSelectionChange}
        sx={{ flexGrow: 1 }}
      >
        {data.map((node) => treeNodeItem(node))}
      </SimpleTreeView>
    </Paper>
  );
};

generatedTreeNavigation.displayName = 'GeneratedTreeNavigation';

export default generatedTreeNavigation;
