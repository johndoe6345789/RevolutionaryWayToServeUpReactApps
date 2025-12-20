# Module: `bootstrap/cdn/dynamic-modules.js`

## Overview

- **Purpose:** Resolve and load CDN-backed dynamic modules such as icon packs by probing provider fallbacks, normalizing package paths, and caching the resulting namespaces in the registry.
- **Entry point:** Exported helpers are attached to `__rwtraBootstrap.helpers.dynamicModules` so the local loader can call `loadDynamicModule` whenever it encounters icons or other runtime rules defined under `config.dynamicModules`.

## Globals

- _None:_ helpers are exported through the shared `helpers.dynamicModules` namespace.

## Functions

- **`loadDynamicModule(name, config, registry)`** — Matches the requested name against `config.dynamicModules`, builds candidate URLs from configured providers/aliases, probes each endpoint, loads the module either via `import()` (for `esm` rules) or `<script>` injection, and caches the namespace so subsequent calls reuse the same exports.
- **`makeNamespace(globalObj)`** — Safely wraps either a module namespace or an existing global object so it behaves like an ES module with a default export; promoted helper for downstream tooling.

## Examples

```ts
const iconNamespace = await loadDynamicModule("icons/mega", config, registry);
iconNamespace.default();
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` explains how the CDN helpers resolve provider fallbacks and probe URLs when `loadDynamicModule` retries across mirrors.
- `docs/api/bootstrap/local/local-module-loader.md` shows how the local loader wires the dynamic module helper into `createRequire`.

## Navigation

- [Bootstrap CDN index](index.md)
- [Bootstrap index](../index.md)
