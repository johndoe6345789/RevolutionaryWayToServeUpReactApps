# Next.js WebUI (MANDATORY)

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
