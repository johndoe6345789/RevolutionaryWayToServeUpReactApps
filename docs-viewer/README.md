# React Doc Viewer

A Next.js + Material UI reader for the platform's markdown documentation. The app renders content from `public/docs`, organizes it with a navigation tree, and applies consistent theming so the docs feel like part of the product.

## Quick start

```bash
cd docs-viewer
npm install
npm run dev
```

- Visit `http://localhost:3000` to browse the docs.
- Build for production with `npm run build` and `npm run start`.
- Lint the code with `npm run lint`.

## How the viewer is structured

| Area | Purpose |
| --- | --- |
| `src/app` | Next.js app router entry point, layout, and global styles. The home page wires navigation, state, and markdown loading. |
| `src/components` | UI primitives: navigation tree, markdown renderer, and Material UI provider wrapper. |
| `src/lib` | Documentation catalogue (`DOCS_STRUCTURE`) plus helpers to look up sections and files. |
| `src/types` | Shared TypeScript interfaces for doc sections/files. |
| `public/docs` | The source markdown files that get fetched and rendered. |
| `scripts` | Utility scripts (if present) for local workflows. |

## Data model and content pipeline

1. **Catalogue definition** — `DOCS_STRUCTURE` lists every section and file with stable IDs and paths inside `public/docs`. The helper functions expose that structure for lookups and UI rendering.【F:docs-viewer/src/lib/docs-structure-data.ts†L1-L78】【F:docs-viewer/src/lib/docs-structure.ts†L1-L3】
2. **Lookup helpers** — `getDocFile`, `getSection`, and `getAllDocFiles` wrap the catalogue for consumers. The helpers shield the UI from needing to walk arrays directly.【F:docs-viewer/src/lib/get-doc-file.ts†L1-L14】【F:docs-viewer/src/lib/get-section.ts†L1-L9】【F:docs-viewer/src/lib/get-all-doc-files.ts†L1-L9】
3. **Markdown source** — Each markdown file lives under `public/docs/<section>/<file>.md`. Those files are fetched at runtime via the browser `fetch` API and rendered as markdown content.
4. **Type safety** — The catalogue and helpers rely on the `DocSection` and `DocFile` interfaces so TypeScript can validate that IDs, titles, and paths are present.【F:docs-viewer/src/types/doc-section.ts†L1-L11】【F:docs-viewer/src/types/doc-file.ts†L1-L8】

## UI flow

1. **Navigation** — `DocsNavigation` reads `DOCS_STRUCTURE` to build a collapsible list grouped by section. It highlights the active document and notifies the parent when a user picks another file.【F:docs-viewer/src/components/docs-navigation.tsx†L15-L75】
2. **Page state** — The home page (`src/app/page.tsx`) tracks the active section/file, fetches markdown when they change, and handles loading/error UI. The first section/file is selected by default so content appears immediately.【F:docs-viewer/src/app/page.tsx†L1-L86】
3. **Rendering** — `MarkdownViewer` wraps `react-markdown` inside a styled Material UI `Paper` element. It tunes typography, code blocks, blockquotes, and tables to keep docs readable.【F:docs-viewer/src/components/markdown-viewer.tsx†L1-L88】
4. **Theming** — `Providers` configures a light Material UI theme with project fonts and baseline styles, keeping the viewer visually consistent.【F:docs-viewer/src/components/providers.tsx†L1-L27】

## Adding or updating documentation

1. Create or edit markdown files inside `public/docs/<section>/...`. Keep filenames in sync with the `path` values in `DOCS_STRUCTURE`.
2. Register the file in `DOCS_STRUCTURE` with a stable `id`, human-friendly `title`, and `path` relative to `/public/docs`. Group related files under a single section entry for tidy navigation.
3. Restart or refresh the dev server. The nav tree and content loader will pick up the new file immediately.

## Styling notes

- Global typography comes from the Material UI theme in `src/components/providers.tsx` and extra rules in `globals.css`.
- Markdown styles (headings, code blocks, blockquotes, tables) live inside `MarkdownViewer` so new elements can be added in one place.
- Navigation uses Material UI list components, giving keyboard and focus styles out of the box.

## Troubleshooting

- **Document not found**: Ensure the `path` in `DOCS_STRUCTURE` matches the file location under `public/docs`.
- **Blank page after selection**: Check browser devtools for fetch errors—missing files or 404s will surface here.
- **Styling regressions**: Look for overrides in `globals.css` or the `MarkdownViewer` component that may be clashing with Material UI defaults.

