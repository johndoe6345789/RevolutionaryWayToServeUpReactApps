# Testing Requirements (100% Coverage MANDATORY)

### Coverage Target
**100% of lines, branches, functions, statements**
- No exceptions for "hard to test" code
- If untestable, redesign the component

### Test Types (All Required)

#### 1. Unit Tests
- Every component in isolation
- Mock all adapters (no real I/O)
- Test lifecycle methods independently
- Validate dataclass field constraints

#### 2. Integration Tests
- Registry/aggregate navigation
- Search ranking correctness
- Message key resolution
- Profile override application
- Tool installation planning (mocked execution)

#### 3. End-to-End Tests
- Full generation pipeline: spec → artifacts
- CLI command execution (mocked shell)
- WebUI rendering (React Testing Library + Playwright)
- Runbook generation and export

#### 4. Cross-Platform Tests
- Run on Windows, macOS, Linux in CI
- Platform-specific command selection
- Path handling (POSIX vs Windows)
- Cache location resolution

#### 5. Determinism Tests
- Same inputs → identical outputs (hash verification)
- UUID stability across regenerations
- Lockfile reproducibility

#### 6. Contract Conformance Tests
- Every concrete class implements/extends required contract
- Registry/aggregate methods adhere to ≤3 public method limit
- Functions adhere to ≤10 line limit

#### 7. Mandatory Spec Tests
- Registry completeness: generated set equals expected set from spec
- Drill-down reachability: every component reachable from root aggregate
- UUID validity/uniqueness: all records have valid, unique RFC 4122 UUIDs
- Search metadata completeness: all records include required fields
- Message key coverage: no missing translations for default locale

#### 8. WebUI Tests
- Search indexing correctness
- Tree navigation rendering (React Testing Library)
- Monaco editor loads with schema validation enabled
- Preview generation correctness (mocked backend API)
- Responsive design (mobile viewports)

### Test Data
- Fixtures in JSON (spec records for testing)
- Golden files for generated artifacts (CLI help, WebUI routes, code output)
- Snapshot tests for output stability (Jest snapshots)
