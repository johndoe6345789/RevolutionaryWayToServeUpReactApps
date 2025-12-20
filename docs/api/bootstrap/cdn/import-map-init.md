# Module: `bootstrap/cdn/import-map-init.js`

## Overview

- **Purpose:** Bootstraps the runtime import map by fetching `config.json`, resolving CDN providers, and wiring fallback behavior into `__rwtraBootstrap.helpers.network` before the rest of the loader runs.
- **Entry point:** Safely executed inside any `<script data-rwtra-importmap>` tag so the import map is populated before `bootstrap.js` or other runtime helpers evaluate dynamic imports.

## Globals

- _None:_ the script only mutates the DOM (the `<script>` element) and the shared bootstrap helper namespace.

## Behavior

- Reads the `<script>` tag tagged with `data-rwtra-importmap` and exits quietly if it does not exist.
- Fetches `config.json` with `cache: "no-store"`, stores the parsed config on `window.__rwtraConfig`, and wires CDN helper callbacks (`setFallbackProviders`, `setDefaultProviderBase`, `setProviderAliases`) to match the configuration.
- Builds the `imports` map by resolving each module via `network.resolveModuleUrl` (falling back to the provided `url` when available) and writes the resulting JSON structure into the import map element so ES modules can rely on `import()` using the configured aliases.
- Caches the promise on `window.__rwtraConfigPromise` to prevent the script from running twice and to let other scripts await the same initialization flow.

## Examples

```html
<script data-rwtra-importmap src="bootstrap/cdn/import-map-init.js"></script>
<script type="module">
  await window.__rwtraConfigPromise;
  await import("icons/flame");
</script>
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` explains how `resolveModuleUrl` probes CDN fallbacks when `config.modules` omit explicit URLs.

## Navigation

- [Bootstrap CDN index](index.md)
- [Bootstrap index](../index.md)
