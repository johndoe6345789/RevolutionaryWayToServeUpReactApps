# Linting & Code Quality System (MANDATORY)

### Core Principle
**All generated code must pass the strictest possible linting and formatting rules for its target language.** This is non-negotiable. Generated code should be an example of perfect code quality.

### No Shell Scripts Policy (MANDATORY)

**NEVER generate bash/batch/PowerShell scripts for build automation.**

Instead:
- **Use language-native scripts**: Python, JavaScript (Node.js), or the target language itself
- **Cross-platform by default**: Python/JavaScript work on all platforms
- **Testable**: Language scripts can be unit tested
- **Maintainable**: No shell quoting nightmares
- **Debuggable**: Standard debugging tools work

**Exception**: Only allow shell scripts for:
- Simple one-liners in documentation examples
- System initialization (when language runtime not yet available)

### Build Tool Integration (MANDATORY)

Codegen MUST generate build configuration that:
1. **Runs linters before build**
2. **Fails build on lint warnings**
3. **Enforces formatting checks**
4. **Runs type checking** (for languages with optional typing)
5. **Includes pre-commit hooks** (via language-native implementation)

### Language-Specific Lint Configurations

#### TypeScript/JavaScript
```json
// Generated: .eslintrc.json
{
  "extends": [
    "eslint:all",
    "plugin:@typescript-eslint/all",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "max-lines-per-function": ["error", 10],
    "max-params": ["error", 3],
    "complexity": ["error", 5],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

```json
// Generated: .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

```json
// Generated: tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```javascript
// Generated: scripts/lint.js (NOT bash!)
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

function run(command) {
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    process.exit(1);
  }
}

console.log('Running ESLint...');
run('eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0');

console.log('Running Prettier check...');
run('prettier --check "**/*.{ts,tsx,js,jsx,json,md}"');

console.log('Running TypeScript compiler...');
run('tsc --noEmit');

console.log('✓ All lint checks passed');
```

```json
// Generated: package.json (partial)
{
  "scripts": {
    "lint": "node scripts/lint.js",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix && prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "build": "npm run lint && tsc",
    "prebuild": "npm run lint"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### Python
```toml
# Generated: pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py310"
select = ["ALL"]  # Enable all rules
ignore = []       # No exceptions

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "N",    # pep8-naming
    "D",    # pydocstyle
    "UP",   # pyupgrade
    "ANN",  # flake8-annotations
    "S",    # flake8-bandit
    "B",    # flake8-bugbear
    "A",    # flake8-builtins
    "C4",   # flake8-comprehensions
    "T20",  # flake8-print
    "RET",  # flake8-return
    "SIM",  # flake8-simplify
    "ARG",  # flake8-unused-arguments
    "PTH",  # flake8-use-pathlib
    "PL",   # pylint
    "RUF",  # ruff-specific
]

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["S101"]  # Allow assert in tests

[tool.mypy]
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.black]
line-length = 100
target-version = ['py310']
include = '\.pyi?

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
