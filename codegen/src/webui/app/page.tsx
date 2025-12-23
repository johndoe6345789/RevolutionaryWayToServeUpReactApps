/**
 * Generated Home Page
 *
 * Next.js home page with tree navigation and full-text search
 *
 * Auto-generated from spec.json
 */

import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import { GeneratedTreeNavigation } from '../components/generated-tree-navigation';
import { GeneratedFullTextSearch } from '../components/generated-full-text-search';

// Create Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

export default function HomePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [searchFilters, setSearchFilters] = useState({});

  // Mock tree data - in real implementation this would come from API
  const treeData = [
    {
      id: 'registries',
      name: 'Registries',
      type: 'aggregate',
      children: [
        {
          id: 'tools',
          name: 'Tools',
          type: 'registry',
          children: [
            { id: 'tool.dev.git', name: 'Git', type: 'tool' },
            { id: 'tool.dev.node', name: 'Node.js', type: 'tool' },
          ],
          metadata: { count: 2 },
        },
        {
          id: 'languages',
          name: 'Languages',
          type: 'registry',
          children: [
            { id: 'language.typescript', name: 'TypeScript', type: 'language' },
            { id: 'language.python', name: 'Python', type: 'language' },
            { id: 'language.go', name: 'Go', type: 'language' },
          ],
          metadata: { count: 3 },
        },
        {
          id: 'profiles',
          name: 'Profiles',
          type: 'registry',
          children: [
            { id: 'profile.fullstack-dev', name: 'Fullstack Dev', type: 'profile' },
          ],
          metadata: { count: 1 },
        },
      ],
    },
  ];

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    console.log('Selected node:', nodeId);
  };

  const handleSearchResultSelect = (resultId: string) => {
    setSelectedNodeId(resultId);
    console.log('Search result selected:', resultId);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Revolutionary Codegen Platform
            </Typography>
            <Typography variant="body2" color="inherit">
              AGENTS.md Compliant
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth={false} sx={{ flex: 1, py: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
            {/* Tree Navigation */}
            <Box sx={{ flex: '0 0 35%', height: '100%' }}>
              <GeneratedTreeNavigation
                data={treeData as any}
                onNodeSelect={handleNodeSelect}
                selectedNodeId={selectedNodeId}
              />
            </Box>

            {/* Search Panel */}
            <Box sx={{ flex: '1', height: '100%' }}>
              <GeneratedFullTextSearch
                onResultSelect={handleSearchResultSelect}
                filters={searchFilters}
                onFiltersChange={setSearchFilters}
              />
            </Box>
          </Box>
        </Container>

        {/* Footer */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mt: 'auto',
            backgroundColor: 'grey.100',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Built with Next.js, Material UI, and Monaco Editor • Following AGENTS.md architecture principles
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
