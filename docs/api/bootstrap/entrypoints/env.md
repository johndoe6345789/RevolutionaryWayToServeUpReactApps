# Module: `bootstrap/entrypoints/env.js`

## Overview

- **Purpose:** Provide a lightweight runtime hint for the server-controlled proxy mode so the bootstrap can decide whether to prefer CI or production providers.
- **Entry point:** Loaded before the CDN helper logic executes (the server can override this file to set a different default in production).

## Globals

- **`__RWTRA_PROXY_MODE__`** — Set to `"auto"` when no host override is present; the CDN helpers read this value to choose between proxy/ direct routes.

- `BaseEntryPoint`
- `EnvInitializer`
- `EnvInitializerConfig`
## Behavior

- The script immediately defines `global.__RWTRA_PROXY_MODE__` with `"auto"` if it hasn’t been set by the hosting environment.
- Because it runs inside an IIFE that accepts `globalThis`, it works both in Node and browser contexts without module-level dependencies.

## Functions

- `configFactory`
## Examples

```html
<script src="bootstrap/entrypoints/env.js"></script>
<script src="bootstrap.js"></script>
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` and `docs/api/bootstrap/cdn/dynamic-modules.md` explain how the proxy mode influences CDN URL selection.

## Navigation

- [Bootstrap README](README.md)
