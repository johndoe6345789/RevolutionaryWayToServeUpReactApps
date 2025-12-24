/**
 * Generated Full-Text Search
 *
 * Search across component metadata with relevance ranking and highlighting
 *
 * Auto-generated from spec.json
 */

import React, { useMemo, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import type { GeneratedFullTextSearchProps } from './types/generated-full-text-search-props';
import type { SearchFilters } from './types/search-filters';
import type { SearchResult } from './types/search-result';

const mockSearchResults: SearchResult[] = [
  {
    id: 'tool.dev.git',
    title: 'Git Version Control',
    summary: 'Distributed version control system for tracking changes in source code',
    domain: 'codegen',
    type: 'tool',
    score: 0.95,
    highlights: ['version control', 'distributed', 'tracking'],
  },
  {
    id: 'language.typescript',
    title: 'TypeScript Language',
    summary: 'Statically typed superset of JavaScript with modern features',
    domain: 'codegen',
    type: 'language',
    score: 0.89,
    highlights: ['statically typed', 'JavaScript', 'modern features'],
  },
  {
    id: 'profile.fullstack-dev',
    title: 'Fullstack Developer Profile',
    summary: 'Complete development environment for fullstack web development',
    domain: 'codegen',
    type: 'profile',
    score: 0.82,
    highlights: ['fullstack', 'development', 'web'],
  },
];

const GeneratedFullTextSearch: React.FC<GeneratedFullTextSearchProps> = ({
  onResultSelect,
  placeholder = 'Search components, tools, profiles...',
  filters = {},
  onFiltersChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>(filters);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return mockSearchResults
      .filter((result) => {
        const matchesQuery =
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.summary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDomain = !selectedFilters.domain || result.domain === selectedFilters.domain;
        const matchesType = !selectedFilters.type || result.type === selectedFilters.type;

        return matchesQuery && matchesDomain && matchesType;
      })
      .sort((a, b) => b.score - a.score);
  }, [searchQuery, selectedFilters]);

  const handleFilterChange = (filterType: keyof SearchFilters) => (event: SelectChangeEvent) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: event.target.value || undefined,
    };
    setSelectedFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleResultClick = (resultId: string) => {
    onResultSelect?.(resultId);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setSelectedFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Search Components
      </Typography>

      {/* Search Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Domain</InputLabel>
          <Select
            value={selectedFilters.domain || ''}
            label="Domain"
            onChange={handleFilterChange('domain')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="codegen">Codegen</MenuItem>
            <MenuItem value="adapter">Adapter</MenuItem>
            <MenuItem value="domain">Domain</MenuItem>
            <MenuItem value="i18n">I18n</MenuItem>
            <MenuItem value="tooling">Tooling</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedFilters.type || ''}
            label="Type"
            onChange={handleFilterChange('type')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="tool">Tool</MenuItem>
            <MenuItem value="language">Language</MenuItem>
            <MenuItem value="profile">Profile</MenuItem>
            <MenuItem value="template">Template</MenuItem>
          </Select>
        </FormControl>

        {activeFilterCount > 0 && (
          <Chip
            icon={<FilterIcon />}
            label={`Clear ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}`}
            onClick={clearFilters}
            variant="outlined"
            color="primary"
          />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Results */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {searchQuery.trim() ? (
          <List>
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <ListItem key={result.id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleResultClick(result.id);
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{result.title}</Typography>
                          <Chip
                            label={result.domain}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${Math.round(result.score * 100)}%`}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.summary}
                          </Typography>
                          {result.highlights.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {result.highlights.slice(0, 3).map((highlight, index) => (
                                <Chip
                                  key={index}
                                  label={highlight}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
              </Box>
            )}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Enter a search query to find components
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default GeneratedFullTextSearch;
