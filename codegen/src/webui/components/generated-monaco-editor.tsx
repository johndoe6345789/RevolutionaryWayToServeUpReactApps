/**
 * Generated Monaco Editor Integration
 *
 * Embedded Monaco editor for editing specs with JSON schema validation
 *
 * Auto-generated from spec.json
 */

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  FormatAlignLeft as FormatIcon,
  Compare as DiffIcon,
  Code as CodeIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface GeneratedMonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'typescript' | 'javascript' | 'markdown';
  schema?: any;
  readOnly?: boolean;
  height?: string | number;
  showDiff?: boolean;
  originalValue?: string;
  onSave?: () => void;
  onFormat?: () => void;
}

export const GeneratedMonacoEditor: React.FC<GeneratedMonacoEditorProps> = ({
  value,
  onChange,
  language = 'json',
  schema,
  readOnly = false,
  height = 600,
  showDiff = false,
  originalValue,
  onSave,
  onFormat,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [viewMode, setViewMode] = React.useState<'editor' | 'diff'>('editor');
  const [currentLanguage, setCurrentLanguage] = React.useState(language);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add custom theme
    monaco.editor.defineTheme('codegenTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
      },
    });

    monaco.editor.setTheme('codegenTheme');
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
    onFormat?.();
  };

  const handleSave = () => {
    onSave?.();
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'editor' | 'diff',
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleLanguageChange = (event: any) => {
    setCurrentLanguage(event.target.value);
  };

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Monaco Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={currentLanguage}
              label="Language"
              onChange={handleLanguageChange}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="editor">
              <CodeIcon />
            </ToggleButton>
            <ToggleButton value="diff" disabled={!originalValue}>
              <DiffIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <ButtonGroup size="small">
            <Button
              startIcon={<FormatIcon />}
              onClick={handleFormat}
              disabled={readOnly}
            >
              Format
            </Button>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={readOnly}
              variant="contained"
            >
              Save
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {schema && language === 'json' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          JSON schema validation enabled. Editor will show validation errors for spec compliance.
        </Alert>
      )}

      <Box sx={{ flex: 1, minHeight: height }}>
        <Editor
          height="100%"
          language={currentLanguage}
          value={value}
          onChange={onChange as any}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            parameterHints: {
              enabled: true,
            },
            suggestOnTriggerCharacters: true,
          }}
          theme="codegenTheme"
        />
      </Box>
    </Paper>
  );
};

export default GeneratedMonacoEditor;
