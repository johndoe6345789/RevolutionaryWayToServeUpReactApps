/**
 * Generated Tree Navigation
 *
 * Hierarchical tree view of aggregates with expand/collapse functionality
 *
 * Auto-generated from spec.json
 */

import React, { useState } from 'react';
import {
  TreeView,
  TreeItem,
} from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';

interface TreeNode {
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

interface GeneratedTreeNavigationProps {
  data: TreeNode[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId: string | undefined;
}

export const GeneratedTreeNavigation: React.FC<GeneratedTreeNavigationProps> = ({
  data,
  onNodeSelect,
  selectedNodeId,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    onNodeSelect?.(nodeId);
  };

  const renderTree = (nodes: TreeNode[]): React.ReactNode =>
    nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
            {node.children ? <FolderIcon /> : <DescriptionIcon />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {node.name}
            </Typography>
            {node.metadata?.count && (
              <Chip
                label={node.metadata.count}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
            {node.metadata?.domain && (
              <Chip
                label={node.metadata.domain}
                size="small"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
      >
        {node.children && renderTree(node.children)}
      </TreeItem>
    ));

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Registry Navigation
      </Typography>
      <TreeView
        aria-label="registry navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectedNodeId}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{ flexGrow: 1 }}
      >
        {renderTree(data)}
      </TreeView>
    </Paper>
  );
};

export default GeneratedTreeNavigation;
