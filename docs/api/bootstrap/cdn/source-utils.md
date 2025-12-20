# Module: `bootstrap/cdn/source-utils.js`

## Overview

- **Purpose:** Analyze source code strings for import declarations, preload declared dependencies, and help the loader discover dynamic modules before executing compiled bundles.
- **Entry point:** Attached to `__rwtraBootstrap.helpers.sourceUtils` so both the browser loader and the test harnesses reuse the same parsing heuristics.

## Globals

- _None:_ exports are collected under the shared helpers namespace.

## Functions

- **`collectDynamicModuleImports(source, config)`** — Parses `import ... from` and `require()` calls, filters them against `config.dynamicModules`, and returns every matching specifier so the dynamic loader can preload icons before rendering.
- **`preloadDynamicModulesFromSource(source, requireFn, config)`** — Bridges the dynamic module collector with `requireFn._async`, warning when any preload fails but otherwise returning once all promises settle.
- **`collectModuleSpecifiers(source)`** — Collects every import/require specifier so the loader can detect all dependencies referenced inside a source string.
- **`preloadModulesFromSource(source, requireFn, baseDir = "")`** — Invokes `_async` for each collected specifier, awaits the results, and throws an aggregated error if any preload fails so calling code can surface helpful diagnostics.

## Examples

```ts
const specs = collectModuleSpecifiers(compiledSource);
await preloadModulesFromSource(compiledSource, requireFn, entryDir);
```

## Related docs

- `docs/api/bootstrap/local/tsx-compiler.md` demonstrates how the compiler uses these helpers to preload every dependency before executing the transformed source.

## Navigation

- [Bootstrap CDN index](index.md)
- [Bootstrap index](../index.md)
