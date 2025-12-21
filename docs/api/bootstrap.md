# Module: `bootstrap.js`

## Overview

- **Purpose:** Orchestrate the client-side bootstrap pipeline for the RetroDeck app — fetching `config.json`, compiling TSX/SCSS, resolving dependencies through the CDN helpers, and rendering the React tree.
- **Entry point:** Import `bootstrap.js` to access helper functions when testing or rendering the app manually; the module also self-invokes `bootstrap()` when loaded in the browser unless the test flag is set.

## Core responsibilities

- **Configuration ingestion:** `loadConfig()` fetches `config.json`, caches it on `window.__rwtraConfig`, and exposes the same result to other helpers (meaning manual scripts can reuse the cached copy if needed).
- **Asset compilation & injection:** `compileSCSS()` processes the configured stylesheet while `injectCSS()` attaches it to the document head so the app ships styled content before React renders.
- **Module loading:** `loadModules()` drives the module registry (including dynamic modules) and `createRequire()` exposes synchronous and asynchronous loaders, while `loadDynamicModule()` supports runtime `global` or ESM imports from the CDN helpers.
- **Framework render:** `frameworkRender()` wires up the configured renderer, attaches error/log listeners, and reports bootstrap lifecycle events through `logClient`.
- **Bootstrapping:** `bootstrap()` glues everything into a runnable flow, handling provider alias setup, tool compilation, local modules, CSS injection, TSX compile/render, and failure logging with graceful degradation.

## Utilities exposed for testing

- `compileTSX()` and `injectCSS()` can be called independently to test render paths without triggering the whole bootstrap pipeline.
- `collectModuleSpecifiers()` and `preloadModulesFromSource()` allow static analysis of source files — they are useful when the loader compiles or bundles additional entry points.
- `loadTools()` and `makeNamespace()` let developers preload side-effectful helpers or wrap global objects inside namespace shims for regression tests.

## Globals

- `BootstrapApp`
## Examples

```ts
import { bootstrap } from "./bootstrap";

bootstrap().catch((err) => console.error("bootstrap failed", err));
```

## Related docs

- The `bootstrap.d.ts` section below describes the TypeScript declarations for every helper exported from this module.

## Runtime globals

- `bootstrapExports` – The CommonJS exports object that tests and tooling can `require` so they can inspect helpers without rerunning the entire bootstrap flow.
- `bootstrapNamespace` – Aliased to `window.__rwtraBootstrap` so helper modules can register themselves in one shared namespace.
- `globalRoot` – Detects the proper global object (`globalThis`, `window`, or `self`) before attaching the bootstrap namespace in either browser or Node contexts.
- `helpersNamespace` – Contains the merged helper namespaces (`helpers.logging`, `helpers.network`, etc.) that other runtime scripts consume.
- `isBrowser` – Set when the script runs in a browser so certain DOM mutations (`document.createElement`) are permitted.
- `isCommonJs` – `true` when running inside Node/Bun so the script exports helpers via `module.exports` instead of mutating `window`.

## Navigation

- [Bootstrap README](README.md)

# Module: `bootstrap.d.ts`

## Overview

- **Purpose:** Provide typed signatures for the bootstrap helpers so editors and build tools can understand the loader API without parsing the handwritten bootstrap runtime.
- **Scope:** Every exported helper from `bootstrap.js` appears in this declaration file, so TypeScript-aware tooling can validate usages in the loader, docs, and any integration tests that call internal helpers.

## Key exports

- `loadConfig(): Promise<Record<string, any>>` — asynchronously fetches `config.json` and caches the parsed payload.
- `loadScript(url: string): Promise<void>` — injects a script tag and resolves when the script loads, logging success or failure.
- `normalizeProviderBase(...)`, `probeUrl(...)`, `resolveModuleUrl(...)` — family of helpers shared with the CDN layer for building normalized CDN URLs and probing them.
- `loadModules(...)`, `createRequire(...)`, `loadDynamicModule(...)` — module registry helpers that track preloaded modules, support asynchronous entry loading, and expose async `require` variants for dynamic content.
- `RequireFn` — The type returned by `createRequire`, which mixes synchronous `require()` with the `_async` loader helpers that the inline compilers and tests rely on.
- `compileSCSS(...)`, `injectCSS(..)`, `compileTSX(...)`, `frameworkRender(...)`, `bootstrap()` — CSS/TSX compilation and render helpers that tie into the runtime pipeline.
- Utility helpers like `collectDynamicModuleImports(...)`, `preloadDynamicModulesFromSource(...)`, `collectModuleSpecifiers(...)`, and `preloadModulesFromSource(...)` are declared here so build-time code generation tasks can leverage them without importing runtime files directly.

## Example pattern

```ts
import { createRequire } from "./bootstrap";

const requireFn = createRequire(registry, config, entryDir);
await requireFn._async("icons/test");
```

## Navigation

- [Bootstrap README](README.md)
