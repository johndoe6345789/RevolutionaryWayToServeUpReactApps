# Module: `bootstrap/entrypoints/module-loader.js`

## Overview

- **Purpose:** Aggregate the CDN, tools, dynamic module, source utilities, and local-loader helpers into a single namespace that the browser runtime and tests can consume.
- **Entry point:** Imported by `bootstrap.js` when the bootstrap runs under CommonJS, and mirrored through the shared `__rwtraBootstrap.helpers` namespace on the client.

## Globals
- `BaseEntryPoint`
- `ModuleLoaderAggregator`
- `ModuleLoaderConfig`
## Re-exported helpers

- Bundles `network`, `tools`, `dynamicModules`, `sourceUtils`, and the local loader when running in Node.js so preloading code has the same API as the browser runtime.
- Because each of these objects is merged into `helpers.moduleLoader`, downstream scripts can destructure the combined exports without manually requiring every helper file.

## Functions

- `configFactory`
## Examples

```ts
const { probeUrl, loadScript, frameworkRender } = require("./bootstrap/entrypoints/module-loader.js");
```

## Related docs

- `docs/api/bootstrap.md` outlines how the loader references these helpers when bootstrapping the app.

## Navigation

- [Bootstrap README](README.md)
