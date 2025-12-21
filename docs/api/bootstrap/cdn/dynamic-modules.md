# Module: `bootstrap/cdn/dynamic-modules.js`

## Overview

- **Purpose:** Resolve and load CDN-backed dynamic modules such as icon packs by probing provider fallbacks, normalizing package paths, and caching the resulting namespaces in the registry.
- **Entry point:** Exported helpers are attached to `__rwtraBootstrap.helpers.dynamicModules` so the local loader can call `loadDynamicModule` whenever it encounters icons or other runtime rules defined under `config.dynamicModules`.

## Globals
- `BaseEntryPoint`
- `DynamicModulesConfig`
- `DynamicModulesService`
- `dynamicModulesService`
## Functions

- **`loadDynamicModule(name, config, registry)`** — Matches the requested name against `config.dynamicModules`, builds candidate URLs from configured providers/aliases, probes each endpoint, loads the module either via `import()` (for `esm` rules) or `<script>` injection, and caches the namespace so subsequent calls reuse the same exports.
- **`makeNamespace(globalObj)`** — Safely wraps either a module namespace or an existing global object so it behaves like an ES module with a default export; promoted helper for downstream tooling.

- `configFactory`
## Internals

- **`addBase(base)`** — Normalizes each provider base once and avoids duplicates when building candidate URLs.
- **`addProvidersInOrder(providers)`** — Pushes the CI or production providers based on the detected host so the loader prefers the right mirrors.
- **`createNamespace(globalObj)`** — Wraps globals or module exports with a `default` property before caching them on the registry.

## Examples

```ts
const iconNamespace = await loadDynamicModule("icons/mega", config, registry);
iconNamespace.default();
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` explains how the CDN helpers resolve provider fallbacks and probe URLs when `loadDynamicModule` retries across mirrors.
- `docs/api/bootstrap/initializers/loaders/local-module-loader.md` shows how the local loader wires the dynamic module helper into `createRequire`.

## Navigation

- [Bootstrap CDN README](README.md)
- [Bootstrap README](../README.md)
