# Workspace tour and documentation guide

This repo already has a focused `README.md` that covers the high-level workflow and requirements (`README.md:1`). The sections below expand on how each logical area is wired together, where to find the key files, and how to operate every workspace so the codebase is well documented for maintainers.

## Client bundle and bootstrap

- `bootstrap.js:1` drives every browser load: it fetches `config.json`, pulls tooling (Sass, Babel) and core modules (React, React DOM, MUI, Emotion) from the configured CDN providers, compiles the SCSS entry point, and dynamically loads the TSX entry file (`src/App.tsx`). The file exports helper functions such as `bootstrap`, `compileTSX`, and `loadModules` that are exercised by the Playwright smoke test as well as the production HTTP server.
- `bootstrap/`: helper modules are grouped by domain—network/logging/dynamic helpers live under `bootstrap/cdn/` (logging.js, network.js, tools.js, dynamic-modules.js, source-utils.js, import-map-init.js) while the local dev infrastructure lives under `bootstrap/initializers/` (compilers/sass-compiler.js, compilers/tsx-compiler.js, path-utils/local-paths.js, loaders/local-module-loader.js, loaders/local-loader.js). Each helper still publishes its API on `__rwtraBootstrap.helpers`, letting both the browser bundle (via sequential script tags) and Node-based tests import only what they need.
- `config.json:1` defines the entry assets (`src/App.tsx`, `styles.scss`), render strategy (`createRoot`/`render`), CDN proxies, npm packages, and dynamic module rules (e.g., `@mui/icons-material`). Documenting `config.json` helps operators understand how CDN resolution, proxying, and dynamic icon loading works without rebuilding the bundle.
- The new `fallbackProviders` array lets you declare CDN base fallbacks (jsDelivr remains the default); `bootstrap/network.js:1` will cycle through these whenever `allowJsDelivr` isn't disabled, so you can add private mirrors or additional public CDNs entirely from the config.
- `index.html`, `bootstrap.js`, `config.json`, `styles.scss`, `bootstrap/`, and `src/` are copied into the Docker image so the runtime can serve the bootstrap entrypoints alongside the app bundle. `styles.scss` globally sets the dark retro theme, while `src/App.tsx:1`, `src/components/*.tsx`, `src/data.ts:1`, and `src/theme.ts:1` compose the RetroDeck UI, pulling typography, color, and layout tokens out of the theme and reusing shared data constants.

## Testing suites

- `e2e/package.json:1`, `e2e/Dockerfile`, and `server/server.js:1` explain how the Playwright smoke test runs. The local `bun run serve` now starts the shared server from the repository root to serve the repo root and proxy CDN requests so `bootstrap.js` can resolve modules without CORS issues. The smoke test itself lives in `e2e/tests/page-load.spec.ts:1`, which only asserts that the hero area and CTA buttons render correctly after the bundle loads.
- `test-tooling/package.json:1` (with Jest + React Testing Library + TypeScript) runs unit tests via `bun test`. The package includes its own `bun.lock`/`bunfig.toml` so it can be run independently, and its `tests/linkSrcNodeModules.js` script mirrors the runtime `src` folder into the test sandbox before Jest runs. The workflow in `.github/workflows/ci.yml:1` installs Bun 1.3.4, installs dependencies in both `ci/` and `e2e/`, runs the unit tests, and then kicks off the Playwright smoke test.

## Deployment, CI, and packaging

- The Docker image described by `Dockerfile:1` uses `node:20-alpine`, installs the `server/` dependencies, and copies `index.html`, `bootstrap.js`, `config.json`, `styles.scss`, `bootstrap/`, and `src/` into `/app` so Bun is not required at runtime. `server/server.js` exposes the bundle on port `4173`, mirroring the port that the smoke test targets.
- `.github/workflows/ci.yml:1` (linked from the README badges) ties together the lint/test/build tasks and versions the published container, while the `ci/` directory holds Bun manifests necessary for CI-specific installs when tests are run inside the workflow container rather than a local developer shell.

## Python helpers

- `python/pyproject.toml:1` defines the `rwtra-scripts` package, which exposes the `bun-wrapper` and `copy-sources` console scripts. `bun-wrapper` (`python/rwtra_scripts/bun_wrapper.py:1`) fetches the latest Bun release, caches it under `$XDG_CACHE_HOME/bun-wrapper`, and forwards CLI arguments to the downloaded binary so developers use a known Bun version without installing it globally. `copy-sources` (`python/rwtra_scripts/copy_sources.py:1`) mirrors select sources (HTML/SCSS/JSON/JS/TSX/TS) into `dist/`, skipping helper directories (`e2e/`, `test-tooling/`, `.git`, etc.) so the generated package only contains the files that need shipping.
- The `python/gh-actions-local-docker/` helper is already documented in its own `README.md:1`. It wraps the `act` binary so maintainers can run GitHub Actions workflows locally with `python -m src.run_actions_local --repo-root ...`, downloading and caching `act` automatically and letting the tooling pass through secrets/env files and job filters.

## Local development recipes

- To develop, run `bun run serve` from the `e2e` workspace, `bun test` inside `test-tooling`, and use `bun run test` again in `e2e` once the HTTP server is running. The Docker smoke test instructions live in the README, and the `python/` scripts are ready for packaging if you want to ship a CLI helper or share caches across machines.
- This document plus the README now offer both a quick-start (repo badges/overview) and a deeper dive into each folder, so future contributors can immediately understand where responsibilities live, how tests are executed, and how the bundle is built/published.
