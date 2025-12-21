# Module: `bootstrap/initializers/loaders/local-loader.js`

## Overview

- **Purpose:** Bridge the CDN bootstrap helpers (SCSS/TSX compilers, logging, module resolution) with the local bundle loader so the app can compile React/SCSS sources on the fly during development or in static hosts.
- **Entry point:** Used by `bootstrap.js` to expose `createRequire`, `frameworkRender`, and the compiler helpers when running under CommonJS or the browser helper namespace.

## Globals
- `BaseEntryPoint`
- `LocalLoaderConfig`
- `LocalLoaderService`
- `localLoaderService`
## Functions / Classes

- **`frameworkRender(config, registry, App)`** — Finds the DOM root element, ensures the configured React/dom modules provide `createRoot` and `createElement`, then renders the compiled `App` component with the requested method (e.g., `render` or `hydrate`).
- **`createRequire(registry, config, entryDir, localModuleLoader, dynamicModuleLoader)`** — Returns a require function that throws if a module is missing, wires `require._async` to fetch local modules (via `localModuleLoader`) or CDN dynamic modules, and exposes the registry to downstream loaders such as the TSX compiler.
- **`getModuleExport(mod, name)`** (internal) — Safely reads properties from CommonJS or namespace-wrapped modules and helps `frameworkRender` adapt to different React builds.
- **`requireAsync(name, baseDir)`** — Internal helper that proxies all async module requests through `_async`, allowing local sources and dynamic CDN modules to be fetched with the same entry points.
- Compiler helpers (`compileSCSS`, `injectCSS`, `compileTSX`, `transformSource`, `executeModuleSource`) and path utilities (`isLocalModule`, `normalizeDir`, `makeAliasKey`, `getModuleDir`) are re-exported so external tooling can reuse them.

- `configFactory`
## Examples

```ts
const requireFn = createRequire(registry, bootstrapConfig, entryDir);
await requireFn._async("components/App");
frameworkRender(bootstrapConfig, registry, App);
```

## Related docs

- `docs/api/bootstrap.md` explains how the bootstrap pipeline wires these helpers together.

## Navigation

- [Bootstrap local tools README](README.md)
