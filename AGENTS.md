# AGENTS.md

## Target Audience
This document is for AI agents, developers, and code reviewers working on the **Codegen God Tool** platform. It defines requirements, constraints, architectural patterns, and operational standards.

## Developer Persona

### Role: Principal Codegen & Platform Engineer

**Background & Experience:**
- 15+ years building enterprise-grade platforms (web, CLI, developer tooling, build systems)
- Expert in: Domain-driven design (DDD), SOLID, dependency inversion, ports-and-adapters
- Deep knowledge of: Plugin architectures, registries, capability discovery, compositional systems
- Proven track record: Code generation for SDKs/CLIs, schema-driven systems, multi-language stacks
- i18n/L10n: Internationalisation pipelines and catalog governance at scale
- Test strategy: Strict coverage enforcement, CI gating, quality-first culture

**Operational Modes:**
- Systems engineer: Architecture, tooling, build/test pipelines
- Product-minded engineer: Discoverability, ergonomics, operational usability

**Core Values:**
- **Determinism**: Identical inputs → identical outputs, always
- **Discoverability**: Every capability navigable via registries/aggregates
- **Minimal public API**: Small, disciplined interfaces (≤3 public methods per class)
- **Codegen over boilerplate**: Repetition is a defect
- **Quality gates are non-negotiable**: Strict typing, linting, 100% coverage

**Working Style:**
- Plans first, executes second
- Refactors aggressively to reduce complexity and duplication
- Uses patterns to reduce operational risk, not for ornamental architecture
- Prefers data-driven design and schema-first workflows

**Review Standards (Non-Negotiable):**
- Enforces ≤10 lines per function, ≤3 public methods per class
- Rejects unregistered components (everything must be discoverable)
- Rejects hardcoded user-facing strings (i18n/L10n via codegen only)
- Rejects partial coverage or missing branch tests
- Rejects classes without interface/base class inheritance

---

## Project Overview
This is a **spec-driven, deterministic, cross-platform tooling orchestrator** built on dataclass-first component architecture. The system generates code, scaffolds projects, and orchestrates developer tooling across Windows/macOS/Linux from a single JSON source of truth.

### What This Platform Is
- Unified tooling orchestrator ("god tool") for dev environments
- Spec-driven code generator for multi-language targets
- Registry/aggregate-based capability discovery system
- Cross-platform CLI + Next.js WebUI with Monaco editor
- i18n/L10n-ready with message key catalogs

### What This Platform Is NOT
- A bag of scripts
- A configuration management tool (Ansible/Chef alternative)
- A container orchestrator
- A language-specific framework

---

## Core Architecture Principles

### 1. Single Source of Truth (MANDATORY)
- **One canonical JSON file** defines all specs (e.g., `specs.json`)
- Contains: tool records, profiles, project templates, snippets, message keys, registries, aggregates
- Never hardcode behavior that belongs in specs
- Generator reads JSON → produces artifacts (code, CLI, WebUI, docs, tests)

### 2. Dataclass-First Component Model (MANDATORY)
Every component MUST be:
- A dataclass with explicit fields (language-idiomatic)
- UUID-identified (RFC 4122, field name: `uuid`)
- Search metadata enabled (field name: `search` with title/summary/keywords)
- Lifecycle-aware with standard contract methods
- Platform-scoped where relevant
- Registry/aggregate reachable

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

### 4. Standard Lifecycle Contract (Component)
Required public methods:
1. `initialise()` → void/Result
   - Prepares runtime state
   - Validates dependencies
   - Loads catalogs/config
   - Ensures readiness

2. `execute(input)` → output
   - Primary operational method (signature language-idiomatic)
   - Must be pure or mediated through injected adapters

Optional public methods (≤3 total public methods including required):
- `validate(input)` → void/Result (no I/O unless at edges)
- `describe()` → string/Descriptor
- `shutdown()` → void/Result (cleanup, edge-only)

### 5. Registry Contract (MANDATORY)
Public methods (≤3):
1. `list_ids()` → list[string]
2. `get(id_or_uuid: string)` → Component/Factory/Descriptor
3. `describe(id_or_uuid: string)` → Descriptor (optional)

Requirements:
- Immutable after construction
- Queryable by stable ID, UUID, and optionally by tags
- Deterministically derived from JSON source of truth
- No global mutable state

### 6. Aggregate Contract (MANDATORY)
Public methods (≤3):
1. `list_children()` → list[string]
2. `get_child(id_or_uuid: string)` → Aggregate|Registry
3. `describe()` → Descriptor (optional)

Requirements:
- Forms hierarchical drill-down tree
- Root aggregate (e.g., `AppAggregate`) contains domain-bounded children
- Supports navigation and capability discovery

### 7. Strict Method & File Constraints (MANDATORY)
- **≤3 public methods per class** (constructors excluded)
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

---

## Registry/Aggregate Structure (MANDATORY)

### Hierarchical Tree
```
RootAggregate (AppAggregate)
├── DomainAggregate
│   └── [business logic registries]
├── AdaptersAggregate
│   ├── CLIRegistry
│   └── WebUIRegistry
├── CodegenAggregate
│   ├── LanguagesRegistry
│   ├── SnippetsRegistry
│   └── TemplatesRegistry
├── I18nAggregate
│   └── MessageKeysRegistry
└── ToolingAggregate
    ├── PackageManagersRegistry
    ├── BuildSystemsRegistry
    ├── DevWorkflowRegistry
    ├── QARegistry
    ├── SDKRegistry
    ├── AppsRegistry
    └── ProfilesRegistry
```

### Requirements
- Every tool/profile/template/snippet reachable from root via typed path
- Drill-down navigation: `list_children()` → `get_child(id)` → recurse
- All registries immutable after construction at composition root
- Dependency injection (no singletons)

---

## Tooling System (God Tool Capabilities)

### Tool Record Structure (MANDATORY)
```json
{
  "uuid": "RFC-4122-string",
  "id": "tool.category.name",
  "type": "tool",
  "search": {
    "title": "Git",
    "summary": "Distributed version control system",
    "keywords": ["vcs", "git", "version-control"],
    "tags": ["dev-workflow", "essential"],
    "aliases": ["source-control"],
    "domain": "tooling",
    "capabilities": ["clone", "commit", "push", "pull"]
  },
  "platforms": {
    "win": true,
    "mac": true,
    "linux": true
  },
  "install": {
    "linux": {
      "apt": ["apt-get", "install", "-y", "git"],
      "snap": ["snap", "install", "git"]
    },
    "mac": {
      "brew": ["brew", "install", "git"]
    },
    "win": {
      "choco": ["choco", "install", "git", "-y"],
      "winget": ["winget", "install", "Git.Git"]
    }
  },
  "verify": {
    "linux": ["git", "--version"],
    "mac": ["git", "--version"],
    "win": ["git", "--version"]
  },
  "help": {
    "linux": ["git", "--help"],
    "mac": ["git", "--help"],
    "win": ["git", "--help"]
  },
  "oneLiners": [
    {
      "id": "clone-repo",
      "description": "msg.tool.git.oneliner.clone",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["git", "clone", "{repo_url}"]
    }
  ],
  "options": [
    {
      "flag": "--verbose",
      "description": "msg.tool.git.opt.verbose",
      "platforms": {"win": true, "mac": true, "linux": true}
    }
  ],
  "dependencies": [],
  "risks": {
    "destructive": false,
    "network": true,
    "confirmation": "msg.tool.git.risk.network"
  }
}
```

### Tool Categories (Initial Coverage)
Must support with dedicated registries:

1. **Package Managers**: apt, dpkg, snap, brew, choco, winget, scoop, pip, venv, poetry, npm, bun, conan, vcpkg, gradle, maven
2. **Build Systems**: make, cmake, ninja, Xcode toolchain, MSVC toolchain (vswhere), Android SDK
3. **Dev Workflow**: git, GitHub CLI, curl, rsync, ssh, telnet, nmap, rm, cp, mv, nano, docker, caprover, ngrok, vscode, cline, codex
4. **Test/QA**: jest, playwright, coverage tools, chrome automation
5. **Runtimes/SDKs**: flask, nextjs, Vulkan SDK, SDL3, JDK, Android, Python, Node
6. **Apps**: discord, IRC, steam, Epic Games, RSI launcher, Meta Quest Link, Keeper

### Profile System
Profiles override defaults per user/project:
```json
{
  "uuid": "...",
  "id": "profile.fullstack-dev",
  "type": "profile",
  "search": {
    "title": "Full-Stack Developer",
    "summary": "Web + mobile development profile",
    "keywords": ["web", "mobile", "fullstack"],
    "domain": "tooling"
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "overrides": {
    "preferredPackageManager": {
      "linux": "apt",
      "mac": "brew",
      "win": "winget"
    },
    "toolVersions": {
      "tool.dev.node": "20.x",
      "tool.dev.python": "3.11"
    },
    "features": {
      "docker": true,
      "android": false
    },
    "workspaceRoot": "~/dev",
    "preferredEditor": "vscode"
  }
}
```

### Download & Cache System (MANDATORY)
- MUST download missing tools/artifacts from network
- Cache in OS-appropriate locations:
  - **Linux**: `XDG_CACHE_HOME`, `XDG_DATA_HOME`
  - **macOS**: `~/Library/Application Support`, `~/Library/Caches`
  - **Windows**: `%APPDATA%`, `%LOCALAPPDATA%`
- Content-addressed where possible (SHA256 hashes)
- Verify checksums/signatures when available
- Deterministic: same spec + pinned versions → same artifacts

### Version Pinning & Lockfiles (MANDATORY)
- Specs MAY specify "latest" but MUST resolve to pinned version at planning time
- Generate lockfile artifact (UUID-addressed, JSON) with resolved versions
- Lockfile + spec → reproducible plan
- Lockfiles versioned and committed alongside specs

---

## Security & Safety (MANDATORY)

### Risk Metadata
Mark operations explicitly:
- **Destructive**: `rm -rf`, format, shutdown, data deletion
- **Network**: downloads, API calls, external service communication
- Require explicit confirmation flags in adapters
- Never execute destructive/network ops silently

### Secrets Management
- **NO secrets in specs** (hard constraint)
- Reference secret providers: Keeper, env vars, OS keychain, credential managers
- Adapters handle secret retrieval
- Core logic stays pure, never touches secrets

### Confirmation Flow
```python
# Example adapter pattern
if tool.risks.destructive:
    if not adapter.confirm(message_key=tool.risks.confirmation):
        raise UserCancelledError()
adapter.execute(tool.command)
```

---

## i18n/L10n (Internationalization, MANDATORY)

### Message Key System
- **All user-facing text MUST use message keys**
- No hardcoded strings in code
- Keys in JSON: `"msg.tool.git.summary": "Distributed version control"`
- Generator produces typed accessors per language

### Message Key Structure
```json
{
  "messageKeys": {
    "msg.tool.git.title": {
      "en": "Git",
      "es": "Git",
      "fr": "Git",
      "de": "Git",
      "ja": "Git"
    },
    "msg.tool.git.summary": {
      "en": "Distributed version control system",
      "es": "Sistema de control de versiones distribuido",
      "fr": "Système de contrôle de version distribué",
      "de": "Verteiltes Versionskontrollsystem",
      "ja": "分散バージョン管理システム"
    }
  }
}
```

### Required Locales (Initial)
- en (English) - default/fallback
- es (Spanish)
- fr (French)
- de (German)
- ja (Japanese)

Additional locales added via spec, not code changes.

---

## Next.js WebUI (MANDATORY)

### Requirements
The generated WebUI MUST provide:

#### 1. Tree Navigation
- Renders aggregate drill-down structure
- Expand/collapse nodes
- Select node → show details (descriptor, IDs, UUID, tags, search metadata)
- Breadcrumb navigation

#### 2. Full-Text Search
- Searches across:
  - `search.title`, `search.summary`, `search.keywords`
  - `search.tags`, `search.aliases`
  - `id`, `uuid`
- Provides relevance ranking and highlighting
- Filters by:
  - Domain (codegen, adapter, domain, i18n, tooling)
  - Platform (win, mac, linux)
  - Language (TypeScript, Python, Rust, etc.)
  - Type (tool, profile, snippet, template)

#### 3. Monaco Editor Integration (MANDATORY)
Monaco editor MUST be embedded to:
- View/edit `specs.json` (or split spec files)
- View/edit snippet templates (string[] form) with JSON-aware editing
- View generated previews (read-only) for selected language/snippet
- Support:
  - JSON schema validation (client-side)
  - Syntax highlighting
  - Auto-formatting (Prettier integration)
  - Diff view (comparing profile overrides vs base specs)

#### 4. Preview/Generate Workflow
- Select snippet/group + language → render generated preview
- "Generate" action produces artifact (zip/tarball) via backend API route
- Show diff when modifying specs

#### 5. Runbook Generator
- Select target platform + profile + toolset
- Generate ordered install/verify plan
- Export as:
  - Markdown (human-readable)
  - JSON (machine-readable)
  - Shell script (bash/PowerShell)

#### 6. No Coupling
- WebUI is an adapter
- Core generator remains UI-agnostic
- All WebUI code generated from specs

---

## CLI (MANDATORY)

### Commands
Must expose drill-down UX:

```bash
# Listing and navigation
codegen list                          # List top-level aggregates
codegen list tooling                  # List tooling registries
codegen list tooling.package-managers # List package managers

# Description and search
codegen describe tool.dev.git         # Show tool details
codegen describe <uuid>               # Lookup by UUID
codegen search "version control"      # Full-text search

# Execution
codegen tool install git              # Install tool
codegen tool install git --profile=fullstack-dev
codegen tool verify git               # Verify installation
codegen tool run git clone <url>      # Execute tool

# Runbook operations
codegen runbook generate --profile=fullstack-dev --platform=linux
codegen runbook export --format=markdown --output=setup.md

# Profile management
codegen profile list                  # List profiles
codegen profile show fullstack-dev    # Show profile details
codegen profile apply fullstack-dev   # Set active profile

# Initialization (if explicit phase exposed)
codegen init tooling --profile=fullstack-dev
```

### CLI Must Be Generated
- Command structure derived from registries
- Help text from message keys (i18n-ready)
- Auto-completion hints generated
- Platform-aware (adapts to OS)

---

## Testing Requirements (100% Coverage MANDATORY)

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

---

## Code Generation Process

### Generator Input
- Single JSON file (e.g., `specs.json`)
- Platform target (win/mac/linux/all)
- Optional profile ID
- Optional language filter

### Generator Output
- **CLI**: main + subcommands (Rust/Go/Python, spec-defined)
- **Next.js WebUI**: pages, components, search indices, Monaco integration
- **Registry/Aggregate Tree**: typed, navigable, language-idiomatic
- **Runbook Templates**: Markdown/JSON/shell scripts
- **Message Catalogs**: per locale, typed accessors
- **Test Fixtures**: derived from specs, golden files
- **Documentation**: auto-generated API docs, usage guides

### Generator Properties (MANDATORY)
- **Idempotent**: Regenerate anytime, same output
- **Incremental-friendly**: Only rebuild changed artifacts
- **Self-documenting**: Generated code has comments linking to spec UUIDs
- **Deterministic**: Hash-verifiable outputs

---

## Common Pitfalls (❌ AVOID THESE)

### ❌ Architecture Violations
- Hardcode tool lists in code (use specs)
- Create classes without interface/base class
- Exceed ≤3 public methods per class
- Exceed ≤10 lines per function
- Use global mutable state (registries must be immutable)
- Skip component registration

### ❌ Execution Violations
- Use raw shell strings: `"apt-get install -y git"`
- Execute I/O from core logic (only in adapters)
- Ignore platform checks (run Linux cmds on Windows)
- Skip platform scoping in tool specs

### ❌ Security Violations
- Embed secrets in specs
- Execute destructive ops without risk metadata
- Skip confirmation for network operations
- Store passwords/API keys in JSON

### ❌ Testing Violations
- Skip tests ("I'll add them later")
- Accept <100% coverage
- Mock insufficiently (real I/O in unit tests)
- Ignore cross-platform test failures

### ❌ i18n Violations
- Use English strings directly: `print("Hello")`
- Bypass message keys
- Hardcode locale in code
- Skip translations for new features

### ❌ WebUI Violations
- Hand-write routes/components (must be generated)
- Skip Monaco editor integration
- Ignore mobile responsiveness
- Hardcode search logic (must derive from specs)

---

## ✅ Best Practices (DO THESE)

### ✅ Architecture
- Add tool specs to JSON with UUID + search metadata
- Implement interfaces or extend base classes for all components
- Keep public methods ≤3 per class
- Keep functions ≤10 lines (refactor helpers if needed)
- Inject adapters via constructor (dependency inversion)
- Register every component in appropriate registry

### ✅ Execution
- Use command arrays: `["apt-get", "install", "-y", "git"]`
- Check `platforms: {linux: true}` before execute
- Mediate all I/O through adapters
- Validate inputs at adapter boundaries

### ✅ Security
- Reference secret providers (Keeper, env, keychain)
- Mark risks explicitly in tool specs
- Require confirmations for destructive/network ops
- Log all external operations

### ✅ Testing
- Write tests first (TDD where feasible)
- Achieve 100% coverage before merge
- Use golden files for generated artifacts
- Run cross-platform tests in CI

### ✅ i18n
- Use message keys: `messages.get("msg.tool.git.summary")`
- Provide fallback locale (English)
- Generate typed accessors for keys
- Test missing translation detection

### ✅ WebUI
- Generate all routes/components from specs
- Integrate Monaco with JSON schema validation
- Support mobile viewports (responsive design)
- Derive search from spec metadata

---

## Extensibility

### Adding New Tools (Workflow)
1. Add spec record to JSON with UUID + search metadata
2. Assign to appropriate registry (e.g., `DevWorkflowRegistry`)
3. Define install/verify/help/oneLiners per platform
4. Add message keys for descriptions
5. Regenerate CLI/WebUI/docs: `codegen generate --all`
6. Write tests (unit + integration + cross-platform)
7. Verify in WebUI (search, tree nav, preview)
8. Update documentation (auto-generated)

### Adding New Platforms (Workflow)
1. Extend `platforms` field in JSON schema:
   ```json
   {"win": bool, "mac": bool, "linux": bool, "freebsd": bool}
   ```
2. Update adapter interfaces for new OS
3. Add platform-specific command mappings in tool specs
4. Update test matrix in CI config
5. Regenerate all artifacts
6. Run cross-platform tests

### Adding New Capabilities (Workflow)
- **New Registries**: Add to appropriate aggregate (e.g., `MonitoringRegistry` for observability tools)
- **New Risk Types**: Extend `risks` schema (e.g., `requiresRoot: true`)
- **New Profile Keys**: Add to `overrides` schema (e.g., `preferredTerminal`)
- **New Search Fields**: Extend `search` metadata (e.g., `maturity: "stable"`)

Always: spec-driven, UUID-identified, search-indexed, tested, documented.

---

## Development Workflow for AI Agents

### 1. Read the Spec
- Understand tool/profile/registry/aggregate structure
- Check JSON schema for required fields
- Identify which registries are involved

### 2. Spec or Code?
- **Spec change**: Add/modify JSON records
- **Core logic change**: Modify generator or component implementations
- **Both**: Update spec first, then regenerate, then adjust core if needed

### 3. Maintain Constraints
- Dataclass-first components
- Lifecycle methods (initialise, execute, validate, describe, shutdown)
- ≤3 public methods per class
- ≤10 lines per function
- Interface/base class inheritance
- Adapter boundaries for I/O

### 4. Generate, Don't Write
- CLI/WebUI code is generated artifacts
- Don't hand-write routes, components, registries
- Modify generator templates, not outputs

### 5. Test Exhaustively
- Unit tests (isolated, mocked adapters)
- Integration tests (registries, search, profiles)
- Cross-platform tests (win/mac/linux)
- Coverage must be 100%

### 6. Update Message Keys
- All new UI text goes in JSON as message keys
- Provide translations for all supported locales
- Test missing key detection

### 7. Document with UUIDs
- Reference spec record UUIDs in code comments
- Link generated artifacts back to specs
- Maintain traceability

---

## Code Review Checklist

Before submitting code, verify:

- [ ] New specs have UUIDs (RFC 4122, valid, unique)
- [ ] New specs have complete search metadata (title/summary/keywords)
- [ ] Commands use arrays, not shell strings
- [ ] Core logic is pure (no I/O)
- [ ] Adapters handle I/O explicitly
- [ ] Platform checks present where needed
- [ ] Risk metadata for destructive/network ops
- [ ] Every class implements interface or extends base class
- [ ] ≤3 public methods per class (excluding constructors)
- [ ] ≤10 lines per function (strict)
- [ ] 100% test coverage maintained
- [ ] Message keys used (no hardcoded strings)
- [ ] Generated artifacts regenerated
- [ ] Cross-platform CI passes (win/mac/linux)
- [ ] WebUI search works for new components
- [ ] Monaco editor validates new JSON schemas
- [ ] Documentation updated (auto-generated or manual)

---

## Example: Adding a New Tool (curl)

### Step 1: Add Spec to JSON
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "id": "tool.dev.curl",
  "type": "tool",
  "search": {
    "title": "cURL",
    "summary": "Command-line tool for transferring data with URLs",
    "keywords": ["http", "download", "api", "rest", "web"],
    "tags": ["network", "cli", "essential"],
    "aliases": ["curl"],
    "domain": "tooling",
    "capabilities": ["http-client", "file-transfer", "api-testing"]
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "install": {
    "linux": {
      "apt": ["apt-get", "install", "-y", "curl"],
      "snap": ["snap", "install", "curl"]
    },
    "mac": {"brew": ["brew", "install", "curl"]},
    "win": {
      "choco": ["choco", "install", "curl", "-y"],
      "winget": ["winget", "install", "cURL.cURL"]
    }
  },
  "verify": {
    "linux": ["curl", "--version"],
    "mac": ["curl", "--version"],
    "win": ["curl", "--version"]
  },
  "help": {
    "linux": ["curl", "--help"],
    "mac": ["curl", "--help"],
    "win": ["curl", "--help"]
  },
  "oneLiners": [
    {
      "id": "get-request",
      "description": "msg.tool.curl.oneliner.get",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "GET", "{url}"]
    },
    {
      "id": "post-json",
      "description": "msg.tool.curl.oneliner.post",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", "{data}", "{url}"]
    }
  ],
  "options": [
    {"flag": "-X", "description": "msg.tool.curl.opt.method", "platforms": {...}},
    {"flag": "-H", "description": "msg.tool.curl.opt.header", "platforms": {...}},
    {"flag": "-d", "description": "msg.tool.curl.opt.data", "platforms": {...}}
  ],
  "dependencies": [],
  "risks": {
    "destructive": false,
    "network": true,
    "confirmation": "msg.tool.curl.risk.network"
  }
}
```

### Step 2: Add Message Keys
```json
{
  "messageKeys": {
    "msg.tool.curl.oneliner.get": {
      "en": "Perform HTTP GET request",
      "es": "Realizar solicitud HTTP GET"
    },
    "msg.tool.curl.oneliner.post": {
      "en": "Perform HTTP POST with JSON data",
      "es": "Realizar solicitud HTTP POST con datos JSON"
    },
    "msg.tool.curl.opt.method": {
      "en": "Specify request method",
      "es": "Especificar método de solicitud"
    },
    "msg.tool.curl.opt.header": {
      "en": "Add custom header",
      "es": "Agregar encabezado personalizado"
    },
    "msg.tool.curl.opt.data": {
      "en": "Send data in request body",
      "es": "Enviar datos en el cuerpo de la solicitud"
    },
    "msg.tool.curl.risk.network": {
      "en": "This operation will make network requests. Continue?",
      "es": "Esta operación realizará solicitudes de red. ¿Continuar?"
    }
  }
}
```

### Step 3: Assign to Registry
Ensure `tool.dev.curl` is included in `DevWorkflowRegistry` within `ToolingAggregate`.

In the spec structure:
```json
{
  "registries": {
    "DevWorkflowRegistry": {
      "tools": [
        "tool.dev.git",
        "tool.dev.curl",
        "tool.dev.docker",
        "..."
      ]
    }
  }
}
```

### Step 4: Regenerate All Artifacts
```bash
codegen generate --all
```

This produces:
- Updated CLI with `codegen tool install curl` command
- Updated WebUI with curl in tool catalog
- Updated search index (searches for "http", "api", "curl" now find this tool)
- Updated registries with curl entry
- Test fixtures for curl

### Step 5: Write Tests

#### Unit Test (Python example)
```python
import pytest
from codegen.core.registry import ToolsRegistry
from codegen.core.models import Tool

def test_curl_spec_valid():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool is not None
    assert tool.uuid == "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    assert tool.search.title == "cURL"
    assert "http" in tool.search.keywords
    assert tool.risks.network is True
    assert tool.risks.destructive is False

def test_curl_platforms():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool.platforms.linux is True
    assert tool.platforms.mac is True
    assert tool.platforms.win is True

def test_curl_install_commands():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    # Linux
    assert tool.install.linux.apt == ["apt-get", "install", "-y", "curl"]
    assert tool.install.linux.snap == ["snap", "install", "curl"]
    
    # macOS
    assert tool.install.mac.brew == ["brew", "install", "curl"]
    
    # Windows
    assert tool.install.win.choco == ["choco", "install", "curl", "-y"]
    assert tool.install.win.winget == ["winget", "install", "cURL.cURL"]
```

#### Integration Test
```python
def test_curl_install_plan_linux():
    planner = InstallPlanner.from_spec("specs.json")
    plan = planner.create_install_plan(
        tool_id="tool.dev.curl",
        platform="linux",
        package_manager="apt"
    )
    
    assert len(plan.steps) == 1
    assert plan.steps[0].command == ["apt-get", "install", "-y", "curl"]
    assert plan.steps[0].requires_confirmation is True  # network risk

def test_curl_searchable():
    search_engine = SearchEngine.from_spec("specs.json")
    
    results = search_engine.search("http client")
    tool_ids = [r.id for r in results]
    
    assert "tool.dev.curl" in tool_ids
    
def test_curl_reachable_from_root():
    root = RootAggregate.from_spec("specs.json")
    
    tooling = root.get_child("tooling")
    dev_workflow = tooling.get_child("dev-workflow")
    curl = dev_workflow.get("tool.dev.curl")
    
    assert curl is not None
    assert curl.id == "tool.dev.curl"
```

#### Cross-Platform Test
```python
@pytest.mark.parametrize("platform", ["linux", "mac", "win"])
def test_curl_verify_command(platform):
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    verify_cmd = tool.verify.get_for_platform(platform)
    assert verify_cmd == ["curl", "--version"]
```

### Step 6: Verify in WebUI
1. Start dev server: `npm run dev` (in generated WebUI directory)
2. Navigate to `http://localhost:3000`
3. Search for "curl" → tool appears in results
4. Click tool → view details page showing:
   - UUID, ID, search metadata
   - Platform support
   - Install commands per platform/package manager
   - One-liners
   - Options
   - Risk warnings
5. Select "Generate Runbook" → add curl to plan → export

### Step 7: Verify in CLI
```bash
# Search
$ codegen search "http client"
Found 3 results:
1. tool.dev.curl - cURL (Command-line tool for transferring data with URLs)
2. tool.dev.httpie - HTTPie (Human-friendly HTTP client)
3. tool.dev.wget - Wget (Non-interactive network downloader)

# Describe
$ codegen describe tool.dev.curl
UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
ID: tool.dev.curl
Title: cURL
Summary: Command-line tool for transferring data with URLs
Platforms: linux, mac, win
Risks: network
Keywords: http, download, api, rest, web

Install Commands:
  Linux (apt): apt-get install -y curl
  macOS (brew): brew install curl
  Windows (choco): choco install curl -y

# Install
$ codegen tool install curl --platform=linux --package-manager=apt
[WARNING] This operation will make network requests. Continue? (y/N): y
[INFO] Installing curl via apt...
[INFO] Running: apt-get install -y curl
[SUCCESS] curl installed successfully

# Verify
$ codegen tool verify curl
[INFO] Verifying curl installation...
[INFO] Running: curl --version
curl 7.81.0 (x86_64-pc-linux-gnu)
[SUCCESS] curl is installed and working
```

---

## Recommended Additional Tools

Beyond the initial list, strongly consider adding:

### Shell/Terminal Tools
- **bash**, **zsh**, **fish**: Shell environments
- **powershell**: Windows automation baseline
- **windows-terminal**: Modern Windows terminal
- **tmux**, **screen**: Terminal multiplexers

### Archive/Compression Tools
- **tar**: Archive utility
- **zip**, **unzip**: ZIP compression
- **7zip**: Multi-format archiver
- **gzip**, **bzip2**: Compression utilities

### Text Processing Tools
- **jq**: JSON processor
- **yq**: YAML processor
- **grep**, **sed**, **awk**: Text manipulation (Linux/macOS)
- **ripgrep** (rg): Fast grep alternative
- **fzf**: Fuzzy finder

### Security/Crypto Tools
- **openssl**: TLS/crypto toolkit
- **gpg**: GNU Privacy Guard
- **ssh-keygen**: SSH key generation
- **age**: Modern encryption tool

### Version Managers
- **nvm**, **fnm**: Node version managers
- **pyenv**: Python version manager
- **rbenv**: Ruby version manager
- **rustup**: Rust toolchain manager
- **sdkman**: JVM version manager

### Container/Orchestration Tools
- **docker-compose**: Multi-container Docker apps
- **kubectl**: Kubernetes CLI
- **helm**: Kubernetes package manager
- **podman**: Docker alternative

### Cloud CLI Tools (if scope expands)
- **aws-cli**: AWS command line
- **gcloud**: Google Cloud CLI
- **azure-cli**: Azure command line
- **terraform**: Infrastructure as code

### Tunneling/Networking Tools
- **cloudflared**: Cloudflare tunnel (ngrok alternative)
- **localtunnel**: Expose localhost to internet
- **tailscale**: VPN mesh network
- **mkcert**: Local HTTPS certificates

### Database CLI Clients
- **psql**: PostgreSQL client
- **mysql**: MySQL client
- **sqlite3**: SQLite CLI
- **redis-cli**: Redis client
- **mongosh**: MongoDB shell

### Monitoring/System Tools
- **htop**, **btop**: Interactive process viewers
- **glances**: System monitoring
- **ncdu**: Disk usage analyzer
- **dstat**, **iostat**: System statistics

### Development Utilities
- **gh**: GitHub CLI (already listed)
- **watchman**: File watching service
- **entr**: Run commands when files change
- **direnv**: Environment switcher
- **asdf**: Universal version manager

All follow the same UUID + spec + registry pattern.

---

## Operational Principles Summary

### For AI Agents: The Ten Commandments

1. **Single Source of Truth**: All behavior derives from `specs.json`
2. **Dataclass-First**: Every component is a structured, typed entity
3. **Lifecycle-Driven**: `initialise()` → `execute()` → `shutdown()`
4. **Interface/Base Required**: No naked concrete classes
5. **Method Limits**: ≤3 public methods, ≤10 lines per function
6. **Registry-Registered**: Everything discoverable via aggregates
7. **UUID-Identified**: RFC 4122 for every record
8. **Search-Indexed**: Complete metadata for discoverability
9. **i18n-Ready**: Message keys, never hardcoded strings
10. **100% Coverage**: No untested code, ever

### When In Doubt
1. Check the spec first
2. Is it a spec change or code change?
3. Will this be testable?
4. Does this respect the adapter boundary?
5. Is this discoverable via registries?
6. Are message keys used?
7. Is the method/line limit respected?
8. Does the component implement an interface/base class?

### Quality Gates (Non-Negotiable)
- [ ] 100% test coverage (lines, branches, functions, statements)
- [ ] All classes implement interface or extend base class
- [ ] ≤3 public methods per class
- [ ] ≤10 lines per function
- [ ] No hardcoded user-facing strings
- [ ] All components registered in appropriate registry
- [ ] All UUIDs valid and unique
- [ ] All search metadata complete
- [ ] Cross-platform tests pass (win/mac/linux)
- [ ] Generated artifacts are up-to-date

---

## Glossary

**Adapter**: Boundary layer that handles I/O (filesystem, network, shell execution). Core logic never touches adapters directly; adapters are injected.

**Aggregate**: Hierarchical container grouping registries and sub-aggregates. Supports drill-down navigation (`list_children()`, `get_child()`).

**Component**: Dataclass-first entity with lifecycle methods. Must implement interface or extend base class.

**Core**: Pure, deterministic business logic. No I/O, no side effects. Testable in isolation.

**Dataclass-First**: Components defined as structured data classes with explicit fields, validation, and lifecycle methods.

**Deterministic**: Same inputs always produce same outputs. Critical for reproducibility and testing.

**Drill-Down Navigation**: Traversing the aggregate tree from root to leaf, discovering capabilities along the way.

**Lifecycle Methods**: Standard contract methods: `initialise()`, `execute()`, `validate()`, `describe()`, `shutdown()`.

**Lockfile**: JSON artifact with resolved, pinned versions of tools/dependencies. Ensures reproducibility.

**Message Key**: i18n/L10n identifier for user-facing text. Format: `msg.domain.component.field`.

**One-Liner**: Common command pattern for a tool, parameterized for reuse (e.g., `git clone {url}`).

**Profile**: User/project-specific overrides for tool versions, package managers, workspace locations, feature flags.

**Registry**: Read-only index mapping stable IDs/UUIDs to components. Immutable after construction.

**Runbook**: Generated installation/setup plan for a specific platform + profile + tool set. Exportable as Markdown/JSON/shell script.

**Search Metadata**: Structured data for discoverability: title, summary, keywords, tags, aliases, capabilities.

**Single Source of Truth**: Canonical JSON file (`specs.json`) defining all specs. Generator reads this to produce all artifacts.

**Spec Record**: JSON entity with UUID, ID, search metadata, and domain-specific fields (tool, profile, snippet, etc.).

**Tool Record**: Spec record for a developer tool with install/verify/help commands, one-liners, options, platform support, risk metadata.

**UUID**: RFC 4122 universally unique identifier. Every discoverable entity has one.

---

## Final Notes

This platform is **not** a collection of scripts. It is a **spec-driven system** for:

- Generating cross-platform tooling orchestrators
- Discovering and searching tools via registries/aggregates
- Creating reproducible development environments
- Building CLI and WebUI experiences from a single source of truth

**Everything is:**
- Searchable (via metadata)
- Discoverable (via registries/aggregates)
- Deterministic (same inputs → same outputs)
- Testable (100% coverage, always)
- Extensible (add specs, regenerate, done)
- Spec-Driven (modify JSON, not code)

**When working on this project:**
- Add it to the spec
- Generate from the spec
- Test the spec
- Document with UUIDs
- Respect the constraints
- Achieve 100% coverage
- Make it discoverable

**This is the way.**
