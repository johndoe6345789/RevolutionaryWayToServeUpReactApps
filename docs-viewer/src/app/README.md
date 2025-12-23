# docs-viewer/src/app

Next.js app router entry point for the React Doc Viewer.

- **page.tsx** — Client-side page that manages selected section/file state, fetches markdown from `/docs`, and renders it through the markdown viewer with loading/error feedback.【F:docs-viewer/src/app/page.tsx†L1-L86】
- **layout.tsx** — Defines the root HTML scaffolding, imports the Geist font, and wraps pages with `Providers` so Material UI theming is available everywhere.【F:docs-viewer/src/app/layout.tsx†L1-L44】
- **globals.css** — Tailors base styles (font families, list resets, layout helpers) to match the viewer's typography.【F:docs-viewer/src/app/globals.css†L1-L86】
- **favicon.ico** — App icon served from the Next.js public assets pipeline.

