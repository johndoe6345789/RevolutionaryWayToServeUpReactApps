# API Reference

This guide documents the interactive surfaces that power the app bundle, the CI helpers, and the local development proxies. Each section references the file that exposes the API so maintainers can quickly locate the implementation.

## Browser bootstrap API

- `bootstrap.js:1` exports functions such as `bootstrap()`, `loadConfig()`, `loadScript()`, and `resolveModuleUrl()` that are used by the e2e server and Playwright suite to compile the `src`/`styles.scss` bundle inside the browser. Its implementation simply aggregates the helper modules listed below, so each helper can be unit-tested and documented separately:
  - `bootstrap/cdn/logging.js` – CI-aware logging, `logClient`, and the `ciLogging` detector.
  - `bootstrap/cdn/network.js` – CDN resolution helpers (`resolveModuleUrl`, `probeUrl`, etc.).
  - `bootstrap/cdn/tools.js` – load tool bundles and create the namespace for exported globals.
  - `bootstrap/cdn/dynamic-modules.js` – dynamic module resolution via prefix-based CDN probing.
  - `bootstrap/cdn/source-utils.js` – source scanning (`collectModuleSpecifiers`, `collectDynamicModuleImports`, preloads).
  - `bootstrap/cdn/import-map-init.js` – hydrates the `<script data-rwtra-importmap>` element with CDN URLs derived from `config.json`.
  - `bootstrap/local/local-loader.js` – SCSS/TSX compilation, require-style loader, and framework render helpers.
  - `bootstrap/local/sass-compiler.js` – SCSS compilation + style injection used before the JS bundle renders.
  - `bootstrap/local/tsx-compiler.js` – Babel source transformation, TSX compilation, and module execution with the test-friendly `moduleContextStack`.
  - `bootstrap/local/local-paths.js` – canonical local module path utilities (`normalizeDir`, `getCandidateLocalPaths`, etc.).
  - `bootstrap/local/local-module-loader.js` – fetches local TS/TSX files, preloads dependencies, and caches compiled exports for `createLocalModuleLoader`.
  - `bootstrap/module-loader.js` – combines the helpers above so the resulting bundle API stays unchanged.
  - The same bootstrap runtime is now composed of helper modules inside `bootstrap/cdn/` and `bootstrap/local/`, so logging, CDN resolution, and module loading code can be understood and tested independently while still exposing the consolidated API surface through `bootstrap.js`.
  - Config-driven tool resolution (`loadTools`) and module loading (`loadModules`), each of which probes several CDN bases (via `resolveProvider`/`normalizeProviderBase`) and retries transient failures (`probeUrl`).
  - Dynamic rules via `dynamicModules`: `loadDynamicModule` inspects the configured prefix list to build CDN candidates (including UMD/dist fallbacks), probes each candidate, loads the matching script, and merges the global into the async registry (`createRequire`/`require._async`). `collectDynamicModuleImports` and `preloadDynamicModulesFromSource` scan TSX/TS sources for imports/`require` statements to warm up the registry before execution.
  - TSX compilation (`compileTSX`, `executeModuleSource`): Babel and TypeScript presets are loaded from the configured tools, sources are transpiled with React/Env presets, dependencies are preloaded, and each module is cached inside the local loader (`createLocalModuleLoader`).
  - Rendering (`frameworkRender`): Reads `config.render` to locate the DOM/React globals, invokes `createRoot`, and calls `render`/`hydrate` as configured. Client logging through `logClient` surfaces bootstrap success/errors if `ciLogging` is enabled.

## Configuration schema

- `config.json:1` defines the entrypoints and CDN graph:
  - `entry`/`styles`: entry TSX/SCSS files compiled by the bootstrapper.
  - `render`: `rootId`, module names for React/DOM, and the render method (`createRoot` + `render` by default).
  - `fallbackProviders`: optional array of CDN bases used when `allowJsDelivr` is not `false`; defaults to `["https://cdn.jsdelivr.net/npm/"]`.
  - `tools`: Babel and Sass loader entries that produce the globals consumed by `compileTSX`/`compileSCSS`.
  - `modules`: explicit React/MUI/Emotion dependencies with `ci_provider`/`production_provider` overrides so CI runs through `e2e/server.js:1`’s `/proxy/unpkg`.
  - `dynamicModules`: prefix-based rules for icon/material helpers; every prefix declares CDN providers, optional package overrides, `filePattern`, and `globalPattern` so `loadDynamicModule` can resolve the requested identifier without bundling the entire module graph.

Documenting `config.json` is essential for anyone adding dependencies, switching CDN providers, or tuning render behavior.

## Local server + proxy API

- `e2e/server.js:1` provides the API surface used by `bun run serve` and the Playwright test:
  - `/proxy/unpkg/*`: proxies CDN requests to `https://unpkg.com` (configurable via `CDN_PROXY_TARGET`) and injects permissive CORS headers so the browser-side bootstrapper can fetch dependencies.
  - `/__client-log`: accepts POSTed JSON logs (event + detail + timestamp) from `bootstrap.js` whenever `ciLogging` is enabled, writes to `e2e/server.log`, and lets Playwright surface bootstrap resolution failures.
  - Static file server: serves the repository root (including `bootstrap.js`, `styles.scss`, `src/`) so the in-browser compiler can load the app just like the production container.

## Python helper CLI APIs

- `python/rwtra_scripts/bun_wrapper.py:1` implements the `bun-wrapper` console script. CLI options:
  - `-c|--cache-dir`: override the cache root (defaults to `XDG_CACHE_HOME/bun-wrapper` or `%LOCALAPPDATA%/bun-wrapper`).
  - `-f|--force-download`: clear any cached release and fetch the latest Bun archive from `https://api.github.com/repos/oven-sh/bun/releases/latest`.
  - `-p|--print-bun-path`: print the resolved Bun binary and exit so tooling can reuse the path.
  - Positional arguments are forwarded verbatim to the downloaded `bun` binary, making the script behave like Bun itself.

- `python/rwtra_scripts/copy_sources.py:1` implements `copy-sources`. CLI options:
  - `-s|--src`: source root to scan (defaults to the repo root).
  - `-d|--dest`: destination directory for copied files (defaults to `dist/`).
  - `--clean`: remove the destination before copying.
  - `--exclude-dir`: repeatable argument to include additional directory names beyond the defaults listed in `DEFAULT_EXCLUDE_DIRS`/`DEFAULT_EXCLUDE_FILES`.
  - Only `.html`, `.scss`, `.json`, `.tsx`, `.ts`, plus `bootstrap.js`, are tracked so the deploy-ready source tree can be mirrored without bundler artifacts.

- `python/gh-actions-local-docker/src/run_actions_local.py:1` builds an `ActRunSpec` containing repo root, workflow/job, event, platform, secrets/env files, reuse flag, verbosity, and dry-run. The script delegates to `python/gh-actions-local-docker/src/act_binary.py:1`, which downloads/caches the correct `act` binary per OS architecture so you can run GitHub Actions locally via `act` without manual downloads.

## Test tooling helpers

- `test-tooling/tests/linkSrcNodeModules.js:1` ensures the Jest environment sees the same `node_modules` tree as the runtime `src/` folder by creating a junction/symlink before tests run.
  - The script runs implicitly via `test-tooling/package.json:1`’s `test` script and tolerates parallel workers by checking whether the symlink already points to the expected target.

With this API reference, contributors can explore the runtime bootstrapper, server proxies, CLI helpers, and test plumbing without reverse-engineering the code.
