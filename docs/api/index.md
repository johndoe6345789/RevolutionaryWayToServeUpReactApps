# API Reference Overview

This folder groups the documented entry points for the bootstrap runtime, UI shell, and supporting helpers.

## Sections

- **Bootstrapping** – `bootstrap/index.md` collects the runtime orchestration, CDN helpers, compiler shims, and TypeScript declarations.
- **Source components** – `src/index.md` describes how the React shell, theme, and data modules fit together.
- **Local helper utilities** – `local/index.md` highlights the filesystem resolver helpers used by dynamic module loading.
- **Server helpers** – `server/index.md` covers the development proxy that powers the e2e/playwright workflows.
- **Stubs** – `stubs/index.md` explains how to regenerate placeholder docs without affecting coverage.

Run `scripts/doc_coverage.py` after adding or updating docs to refresh the documented coverage summary.
