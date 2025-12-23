# Core Architecture Principles

### 1. Single Source of Truth (MANDATORY)
- **One canonical JSON file** defines all specs (e.g., `specs.json`)
- Contains: tool records, profiles, project templates, snippets, message keys, registries, lifecycle builders
- Never hardcode behavior that belongs in specs
- Generator reads JSON → produces artifacts (code, CLI, WebUI, docs, tests)

### 2. Dataclass-First Component Model (MANDATORY)
Every component MUST be:
- A dataclass with explicit fields (language-idiomatic)
- UUID-identified (RFC 4122, field name: `uuid`)
- Search metadata enabled (field name: `search` with title/summary/keywords)
- Lifecycle-aware with standard contract methods
- Platform-scoped where relevant
- Registry/lifecycle builder reachable

### 3. Inheritance/Interface Requirement (MANDATORY)
**No standalone concrete classes allowed.**

Every class MUST either:
- Implement an interface, OR
- Extend a base class (preferred when shared logic exists)

Language-idiomatic contracts:
- **TypeScript**: `implements Interface` or `extends Base`
- **Python**: `abc.ABC` + `Protocol` as appropriate
- **C++**: Pure virtual interface base class
- **Rust**: `trait` + struct implementing trait
- **Go**: Interface type + struct implementation
- **C#**: `Interface` or `abstract class`

### 4. Standard Lifecycle Contract (IStandardLifecycle)
All components MUST implement the `IStandardLifecycle` interface. Required methods:

1. `initialise()` → void/Result
   - Called after construction
   - Register with dependency registry
   - Prepare runtime state and load configuration

2. `validate()` → void/Result
   - Pre-flight checks before execution
   - Verify dependencies and configuration
   - Should fail fast (synchronous where possible)

3. `execute()` → void/Result
   - Primary operational method
   - Return values sent via internal messaging service
   - Data flows through Redux-like messaging pattern

4. `cleanup()` → void/Result
   - Resource cleanup and shutdown
   - Should be idempotent

Additional required methods:
- `debug()` → Record<string, unknown> (diagnostic data)
- `reset()` → void/Result (state reset for testing)
- `status()` → LifecycleStatus (current state enum)

The interface is intentionally lean. Optional extensions (pause/resume/stop) added via interface inheritance only.

### 5. Registry Contract (MANDATORY)
Public methods (53):
1. `list_ids()` → list[string]
2. `get(id_or_uuid: string)` → Component/Factory/Descriptor
3. `describe(id_or_uuid: string)` → Descriptor (optional)

Requirements:
- Immutable after construction
- Queryable by stable ID, UUID, and optionally by tags
- Deterministically derived from JSON source of truth
- No global mutable state

### 6. LifecycleBuilder Pattern (MANDATORY)
Fluent API for component orchestration with dependency management and error policies:

```typescript
interface LifecycleBuilder {
  add(name: string, lifecycle: IStandardLifecycle, startOrder?: number, stopOrder?: number): this;
  dependsOn(name: string, dependencyName: string): this;
  onError(policy: 'fail-fast' | 'continue' | 'rollback'): this;
  build(): CompositeLifecycle;
}
```

Requirements:
- Declarative component composition with explicit dependencies
- Automatic startup/shutdown orchestration
- Configurable error handling (fail-fast/continue/rollback)
- Topological dependency resolution for initialization order

### 7. Strict Method & File Constraints (MANDATORY)
- **≤5 public methods per class** (constructors excluded)
- **≤10 lines per function** (strict, no exceptions)
- **One primary class per file**
- If a function exceeds 10 lines, refactor into helper methods

### 8. UUID Requirement (RFC 4122, MANDATORY)
Every discoverable entity MUST include:
- Field name: `uuid`
- Format: RFC 4122 UUID string (8-4-4-4-12 hex)
- Preferred versions:
  - **v4**: Random UUIDs
  - **v5**: Deterministic UUIDs (derived from stable namespace + ID)
- Uniqueness enforced by schema validation and CI tests

### 9. Search Metadata Requirement (MANDATORY)
Every JSON record MUST include:
```json
{
  "uuid": "...",
  "id": "stable.namespaced.id",
  "search": {
    "title": "Short Human Name",
    "summary": "One-paragraph description",
    "keywords": ["array", "of", "terms"],
    "tags": ["optional", "normalized"],
    "aliases": ["synonyms", "optional"],
    "domain": "codegen|adapter|domain|i18n|tooling",
    "capabilities": ["generate", "list", "install"]
  }
}
```

Used by:
- CLI search command
- WebUI full-text search/filter
- Internal component selection logic

### 10. No Raw Shell Strings (MANDATORY)
- Commands MUST be: `["executable", "arg1", "arg2"]` arrays
- Shell wrappers (bash/cmd/PowerShell) only when unavoidable
- Escape/quote handling via platform-specific adapters
- Never use string concatenation for command building

### 11. Execution Boundaries (MANDATORY)
- **Core** = pure, deterministic, testable logic (no I/O)
- **Adapters** = I/O, shell execution, network, filesystem
- Core never touches I/O directly
- All execution mediated through injected adapter interfaces
