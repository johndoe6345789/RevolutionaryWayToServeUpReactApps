# Module: `bootstrap/cdn/network.js`

## Overview

- **Purpose:** Probe CDN endpoints, resolve module URLs from configured providers (including aliases/fallbacks), and expose helpers that other bootstrap scripts (import map init, dynamic modules, tools) depend on.
- **Entry point:** Accessed through `__rwtraBootstrap.helpers.network` so both browser loaders and Node-based tests can negotiate providers and perform retries consistently.

## Globals

- _None:_ all helpers are exported via the shared namespace.

## Functions

- **`setFallbackProviders(providers)` / `getFallbackProviders()`** — Manage the cached list of fallback mirrors defined by `config.fallbackProviders`, normalizing the URLs and preserving aliases.
- **`setDefaultProviderBase(base)` / `getDefaultProviderBase()`** — Keep track of the base provider that hosts the packaged modules when no explicit provider is requested.
- **`setProviderAliases(aliases)`** — Normalizes alias/URL pairs so `normalizeProviderBase` always returns consistent fully-qualified URLs even when consumers supply short names.
- **`normalizeProxyMode(mode)` / `getProxyMode()`** — Interpret explicit proxy flags (`proxy`, `direct`, `auto`), fall back to `window.__RWTRA_PROXY_MODE__`, and inspect the `RWTRA_PROXY_MODE` environment variable so CI/test scripts can force behaviors.
- **`shouldRetryStatus(status)`** — Returns `true` when the HTTP response is worth retrying (e.g., 0, 429, 5xx).
- **`loadScript(url)`** — Injects a `<script>` tag with `async=false`, logs results, and rejects when the script fails to load.
- **`normalizeProviderBase(provider)`** — Normalizes CDN base URLs, resolves aliases, adds missing protocols, and always returns a trailing slash.
- **`resolveProvider(mod)`** — Chooses the appropriate provider (CI, production, fallback) for a module entry, honoring `allowJsDelivr` and the current proxy mode.
- **`probeUrl(url, opts)`** — Sends repeated `HEAD`/`GET` probes with exponential backoff to find the first reachable URL before trying the next fallback.
- **`resolveModuleUrl(mod)`** — Iterates over each provider path, builds candidate URLs based on `package`, `file`, `pathPrefix`, etc., probes them with `probeUrl`, and throws if none respond.

## Examples

```ts
logClient("cdn:probe", { url: testedUrl });
const url = await resolveModuleUrl({ name: "icons/flame", provider: "https://cdn.example.com/" });
```

## Related docs

- `docs/api/bootstrap/cdn/dynamic-modules.md` uses `resolveModuleUrl` to load icons.
- `docs/api/bootstrap/cdn/import-map-init.md` depends on `setFallbackProviders` to mirror `config.json` for the import map.

## Navigation

- [Bootstrap CDN index](index.md)
- [Bootstrap index](../index.md)
