# Module: `test-tooling/tests/local-paths.test.ts`

## Overview

- **Purpose:** Exercise `bootstrap/initializers/path-utils/local-paths.js` helpers (`isLocalModule`, `normalizeDir`, `getCandidateLocalPaths`) to ensure filesystem references resolve predictably while loading modules.
- **Entry point:** Calls each helper with sample paths (`./components/App`, `/src/theme`) and asserts the normalized outputs.

## Assertions

- Verifies `isLocalModule` detects `.`/`/` prefixes and rejects CDN names.
- Confirms `getCandidateLocalPaths` yields `.tsx`, `.ts`, and `/index.js` fallbacks for every entry.

## Related docs

- `docs/api/local/local-paths.md`

## Navigation

- [Testing overview](../../README.md)
