# docs-viewer/public/docs

This directory is the content source for the React Doc Viewer. Everything under here is served statically by Next.js and fetched by the client at `/docs/<section>/<file>.md`.

## Structure

- Top-level folders (`architecture`, `concepts`, `interfaces`, `systems`) map to sections defined in `src/lib/docs-structure-data.ts`.
- Each markdown file inside a folder represents one document entry in a section's `files` array.
- Section-level `README.md` files can provide overviews but are not automatically linked unless you add them to `DOCS_STRUCTURE`.

## Adding content

1. Create the markdown file under the correct section folder.
2. Update `DOCS_STRUCTURE` so the viewer can link to it and display the right title/path.
3. Keep filenames lowercase-with-dashes to stay consistent with existing entries.

## Authoring tips

- Use standard markdown headings; the viewer styles `h1`–`h4`, lists, code fences, tables, and blockquotes for readability.【F:docs-viewer/src/components/markdown-viewer.tsx†L1-L88】
- Favor shorter sections with descriptive headings so the navigation tree remains scannable.
- If you need code highlighting nuances, wrap snippets in triple backticks; inline code is also supported.

