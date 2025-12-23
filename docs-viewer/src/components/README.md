# docs-viewer/src/components

UI building blocks for the React Doc Viewer.

- **providers.tsx** — Wraps pages with a Material UI theme and `CssBaseline` so the app shares fonts, colors, and resets.【F:docs-viewer/src/components/providers.tsx†L1-L27】
- **docs-navigation.tsx** — Builds the collapsible section/file navigation from `DOCS_STRUCTURE`, tracks which sections are open, and calls `onFileSelect` when a document is chosen.【F:docs-viewer/src/components/docs-navigation.tsx†L15-L75】
- **markdown-viewer.tsx** — Renders markdown via `react-markdown` and applies typography, spacing, and code/table styling for readable docs.【F:docs-viewer/src/components/markdown-viewer.tsx†L1-L88】

These components are client-side (`"use client"`) because they rely on browser interactions (stateful navigation and fetch-driven markdown rendering).

