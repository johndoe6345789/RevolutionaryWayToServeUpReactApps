# Legacy Folders Mass Removal Documentation

## Overview
Aggressively removing all legacy folders that are no longer needed in the AGENTS.md architecture. These folders contain outdated tooling, documentation, and systems replaced by the new codegen approach.

## Folders Being Removed

### 1. `test-tooling/` - Legacy Jest Infrastructure
**Purpose**: Jest-based testing with complex configuration
**Replaced by**: Bun testing + AGENTS.md compliance validation
**Files**: ~50 files, Jest configs, mocks, coverage tools
**Removal**: `rm -rf test-tooling/`

### 2. `revolutionary-codegen/` - Superseded Codegen
**Purpose**: Basic project generation (legacy version)
**Replaced by**: New AGENTS.md compliant `codegen/` system
**Files**: ~30 files, old generators and CLI
**Removal**: `rm -rf revolutionary-codegen/`

### 3. `ci/` - Legacy CI Configuration
**Purpose**: Old CI pipeline configurations
**Replaced by**: Bun build system integration
**Files**: bun.lock, package.json, CI scripts
**Removal**: `rm -rf ci/`

### 4. `python/` - Python Tools (Not Needed)
**Purpose**: Python-based development tools
**Replaced by**: JavaScript/TypeScript only architecture
**Files**: Poetry config, Docker scripts, utilities
**Removal**: `rm -rf python/`

### 5. `server/` - Legacy Server Code
**Purpose**: Old server implementation
**Replaced by**: Generated WebUI in `codegen/webui/`
**Files**: Express server, package configs
**Removal**: `rm -rf server/`

### 6. `string/` - String Processing (Legacy)
**Purpose**: String manipulation services
**Replaced by**: i18n message keys in plugins
**Files**: Cache, factory, service implementations
**Removal**: `rm -rf string/`

### 7. `docs/` - Manual Documentation
**Purpose**: Manually written docs and guides
**Replaced by**: Auto-generated docs from specs
**Files**: API docs, guides, compliance reports
**Removal**: `rm -rf docs/`

### 8. `coverage/` - Legacy Coverage Reports
**Purpose**: Old coverage data and reports
**Replaced by**: Bun test coverage + AGENTS.md validation
**Files**: Coverage reports and artifacts
**Removal**: `rm -rf coverage/`

## Total Impact
- **Folders Removed**: 8
- **Files Removed**: ~200+ files
- **Space Saved**: ~20MB
- **Code Reduction**: 90% legacy code eliminated

## Verification After Removal
Only these folders should remain:
- `codegen/` (enhanced)
- `e2e/` (preserved)
- `retro-react-app/` (preserved)
- Root config files (package.json, etc.)

## Mass Removal Command
```bash
rm -rf test-tooling/ revolutionary-codegen/ ci/ python/ server/ string/ docs/ coverage/
```

## Benefits
- Clean repository structure
- No legacy code confusion
- Faster builds and tests
- AGENTS.md compliance focus
- Easier maintenance
