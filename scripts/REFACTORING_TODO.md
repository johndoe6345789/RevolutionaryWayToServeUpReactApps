# Dev-Cli Plugin Refactoring TODO

## Phase 1: Infrastructure Updates
- [x] Update plugin discovery to work with folders instead of single files
- [x] Create metadata JSON loader and parser
- [x] Implement module loader for atomic modules (100 LOC max)
- [x] Update base plugin class for new folder-based architecture
- [x] Create plugin folder structure validation utilities

## Phase 2: Refactor Existing Plugins
- [x] Refactor dependency-analyzer.plugin.js → folder structure with atomic modules
- [ ] Refactor test-runner.plugin.js → folder structure with atomic modules
- [ ] Refactor coverage-report.plugin.js → folder structure with atomic modules
- [ ] Refactor analysis-related plugins to new format
- [ ] Refactor utility plugins to new format
- [x] Ensure all modules are under 100 lines of code

## Phase 3: Bundle Creation
- [x] Create bundled/ directory structure
- [ ] Bundle regular plugins into collections
- [ ] Implement version management for bundled plugins
- [ ] Add plugin dependency resolution system
- [ ] Create plugin distribution and loading system

## Phase 4: Tooling & Validation
- [x] Add module size validation (max 100 LOC)
- [x] Create plugin development scaffolding tools
- [ ] Add automated testing framework for plugins
- [ ] Implement plugin lifecycle management
- [ ] Create plugin documentation generation

## Phase 5: Testing & Validation
- [ ] Test all refactored plugins work correctly
- [ ] Validate plugin loading and execution
- [ ] Test bundle creation and loading
- [ ] Verify performance improvements
- [ ] Update documentation and examples
