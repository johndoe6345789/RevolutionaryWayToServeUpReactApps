# docs-viewer/src/lib

Documentation catalogue and lookup helpers.

- **docs-structure-data.ts** — The authoritative list of documentation sections and files. Update this file when adding or renaming markdown content.【F:docs-viewer/src/lib/docs-structure-data.ts†L1-L78】
- **get-doc-file.ts** — Finds a doc entry by section and file ID so callers can resolve the correct path and metadata.【F:docs-viewer/src/lib/get-doc-file.ts†L1-L14】
- **get-section.ts** — Returns a section entry by ID, useful for navigation and section-level UI.【F:docs-viewer/src/lib/get-section.ts†L1-L9】
- **get-all-doc-files.ts** — Flattens the catalogue into a single list of files (handy for search or indexing).【F:docs-viewer/src/lib/get-all-doc-files.ts†L1-L9】
- **docs-structure.ts** — Re-exports the catalogue and helpers for backward compatibility across imports.【F:docs-viewer/src/lib/docs-structure.ts†L1-L3】

