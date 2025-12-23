# docs-viewer/src

This directory holds the application source code for the React Doc Viewer. The key areas are:

- `app/` — Next.js app router entry point, layout, global styles, and the home page that fetches markdown files and renders them.
- `components/` — Reusable UI pieces such as the navigation tree, markdown renderer, and Material UI provider wrapper.
- `lib/` — Documentation catalogue (`DOCS_STRUCTURE`) plus helper functions for looking up sections and files.
- `types/` — TypeScript interfaces that describe doc sections, files, and the full content tree.

### Runtime flow

1. The home page (`app/page.tsx`) keeps track of the selected section/file, fetches the markdown from `public/docs`, and handles loading/error UI.【F:docs-viewer/src/app/page.tsx†L1-L86】
2. `components/docs-navigation.tsx` reads the catalogue to build a collapsible section/file list and notifies the page when the user picks a new document.【F:docs-viewer/src/components/docs-navigation.tsx†L15-L75】
3. `components/markdown-viewer.tsx` styles and renders the markdown content with `react-markdown` and Material UI typography.【F:docs-viewer/src/components/markdown-viewer.tsx†L1-L88】
4. Theme defaults (colors, fonts, baselines) are set in `components/providers.tsx` so every page uses the same Material UI theme.【F:docs-viewer/src/components/providers.tsx†L1-L27】

### Working with the catalogue

- The canonical list of sections/files lives in `lib/docs-structure-data.ts`. Update it when adding docs so navigation and fetches stay in sync.【F:docs-viewer/src/lib/docs-structure-data.ts†L1-L78】
- Helper functions in `lib/get-doc-file.ts`, `lib/get-section.ts`, and `lib/get-all-doc-files.ts` centralize lookups and can be reused by new routes or components.【F:docs-viewer/src/lib/get-doc-file.ts†L1-L14】【F:docs-viewer/src/lib/get-section.ts†L1-L9】【F:docs-viewer/src/lib/get-all-doc-files.ts†L1-L9】
- Types in `types/doc-file.ts` and `types/doc-section.ts` keep the catalogue strongly typed to prevent mismatched IDs or paths.【F:docs-viewer/src/types/doc-file.ts†L1-L8】【F:docs-viewer/src/types/doc-section.ts†L1-L11】

