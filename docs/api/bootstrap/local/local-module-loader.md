# Module: `bootstrap/local/local-module-loader.js`

## Overview

- **Purpose:** Expose a local module loader that resolves filesystem-style paths, caches compiled bundles, and preloads dependencies so local development can run without a full build step.
- **Entry point:** The loader is registered on `__rwtraBootstrap.helpers.localModuleLoader` and powers `createRequire` when the bootstrap runs under Node or inside the dev server.

## Globals

- **`helpers.localModuleLoader`** — The exported helper namespace that other scripts use to call `createLocalModuleLoader` or `fetchLocalModuleSource`.

## Functions

- **`createLocalModuleLoader(entryDir)`** — Returns an async loader that normalizes the base directory, resolves local candidates via `localPaths`, preloads dependencies (`sourceUtils.preloadModulesFromSource`), transforms the source (`tsxCompiler.executeModuleSource`), and caches the results so the same module path is never recompiled twice.
- **`fetchLocalModuleSource(basePath)`** — Walks every `getCandidateLocalPaths` variant, attempts to fetch the first 200 response, and throws a descriptive error if the local module cannot be found.

## Examples

```ts
const loadLocalModule = createLocalModuleLoader("src");
await loadLocalModule("components/Button", "src", requireFn, registry);
```

## Related docs

- `docs/api/bootstrap/local/index.md` explains how this loader composes the TSX compiler, Sass helper, and path utilities.
- `docs/api/bootstrap/local/local-paths.js` shows how candidate paths and alias keys are generated.

## Navigation

- [Bootstrap local tools index](index.md)
- [Bootstrap index](../index.md)
