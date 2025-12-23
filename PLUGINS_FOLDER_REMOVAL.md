# Plugins Folder Removal Documentation

## Overview
The `plugins/` directory contains analysis and development tools written as individual plugin files. These will be migrated to the new AGENTS.md-compliant plugin architecture in `codegen/plugins/tools/`.

## What Plugins Does
- **OOP Analysis**: SOLID, DRY, KISS, YAGNI principle checking
- **Code Quality**: Test coverage, interface compliance, dependency analysis
- **Development Tools**: Refactoring suggestions, test synchronization
- **Language Analysis**: Cross-language code analysis
- **Documentation**: API coverage, doc generation

## Key Components Being Migrated/Removed

### Core Analysis Plugins
- `oop-principles.plugin.js`: OOP principle validation
- `interface-coverage.plugin.js`: Interface implementation checking
- `test-runner.plugin.js`: Test execution and reporting
- `dependency-analyzer.plugin.js`: Code dependency analysis

### Development Tools
- `refactoring.plugin.js`: Code refactoring suggestions
- `project-template.plugin.js`: Project scaffolding
- `coverage-report.plugin.js`: Coverage reporting

### Analysis Plugins
- `cross-language-analysis.plugin.js`: Multi-language analysis
- `doc-coverage.plugin.js`: Documentation coverage
- `parameterised-test-scanner.plugin.js`: Test parameter analysis

## Migration Strategy
**Migrated to**: `codegen/plugins/tools/` with AGENTS.md compliance

Plugins will be restructured as:
- One plugin per tool (one directory per plugin)
- JSON specs for configuration
- AGENTS.md compliant classes (1 param, ≤3 methods, ≤10 lines)
- Generated interfaces and base classes

## File Structure After Migration
```
codegen/plugins/tools/
├── oop-principles/
│   ├── plugin.json (manifest)
│   ├── spec.json (configuration)
│   ├── src/
│   │   ├── oop_plugin.js (AGENTS.md compliant)
│   │   └── analyzers/
│   └── tests/
├── test-runner/
│   ├── plugin.json
│   ├── spec.json
│   └── src/
└── interface-coverage/
    ├── plugin.json
    ├── spec.json
    └── src/
```

## Breaking Changes
- Individual plugin files → Structured plugin directories
- Manual plugin loading → Spec-driven registration
- Hardcoded analysis logic → Generated dataclasses
- Direct execution → Registry-mediated execution

## Benefits After Migration
- Plugin isolation and testability
- AGENTS.md compliance
- Spec-driven configuration
- Registry discoverability
- Easier plugin development

## Removal Command
```bash
rm -rf plugins/
```

## Files Removed: 20+ plugin files
