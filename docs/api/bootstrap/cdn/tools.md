# Module: `bootstrap/cdn/tools.js`

## Overview

- **Purpose:** Provide the bootstrap with utilities for loading external helper tools, converting global objects into ES-style namespaces, and initializing module registries with logging.
- **Entry point:** Exported helpers are attached to `__rwtraBootstrap.helpers.tools` so `bootstrap.js` and tests can call them directly.

## Globals

- _None:_ helpers are exported through the namespace.

## Functions

- **`loadTools(tools)`** — Iterates the configured helper table, resolves each CDN URL via `network.resolveModuleUrl`, loads the script, and ensures the declared global exists, logging successes/failures through `logging.logClient`.
- **`makeNamespace(globalObj)`** — Wraps legacy globals to behave like ES modules with `default` exports and proxies any additional properties onto the namespace.
- **`loadModules(modules)`** — Loads every named module from `config.modules`: it either loads the script (for global modules) or `import()`s it (for ES modules), attaches logging hooks, and populates a registry keyed by `module.name`.

## Related docs

- `docs/api/bootstrap/cdn/network.md` explains how URLs are resolved before `loadTools` or `loadModules` fetch assets.
- `docs/api/bootstrap/cdn/logging.md` shows how `logClient` records module/load events for CI debugging.

## Navigation

- [Bootstrap CDN index](index.md)
- [Bootstrap index](../index.md)
