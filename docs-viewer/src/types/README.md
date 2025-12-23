# docs-viewer/src/types

Shared TypeScript contracts for the documentation catalogue.

- **doc-file.ts** — Shape of an individual document entry: `id`, `title`, `path`, and owning `section`.【F:docs-viewer/src/types/doc-file.ts†L1-L8】
- **doc-section.ts** — Represents a section that holds a list of `DocFile` entries. Used by navigation and content lookups.【F:docs-viewer/src/types/doc-section.ts†L1-L11】
- **doc-content.ts** — Wraps the full set of sections when you need to treat the docs as one content tree.【F:docs-viewer/src/types/doc-content.ts†L1-L8】
- **docs.ts** — Convenience re-exports of the above interfaces for legacy imports.【F:docs-viewer/src/types/docs.ts†L1-L4】

