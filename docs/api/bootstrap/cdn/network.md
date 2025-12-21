# Module: `bootstrap/cdn/network.js`

## Overview

- **Purpose:** Probe CDN endpoints, resolve module URLs from configured providers (including aliases/fallbacks), and expose helpers that other bootstrap scripts (import map init, dynamic modules, tools) depend on.
- **Entry point:** Accessed through `__rwtraBootstrap.helpers.network` so both browser loaders and Node-based tests can negotiate providers and perform retries consistently.

## Globals
- `NetworkEntryPoint`
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

## Internal helpers

- **`DEFAULT_PROVIDER_ALIASES`** — Base alias map derived from `config.json` or the running `__rwtraConfig`, providing canonical hosts when no alias is declared.
- **`addBase(base)` / `collectBases()`** — Normalize and deduplicate provider URLs before `resolveModuleUrl` probes them; the same helpers ensure `probeUrl` never retries the same base.
- **`createAliasMap(source)`** — Converts alias object literals into a `Map` with normalized URLs so `normalizeProviderBase` can quickly lookup replacements.
- **`isCiLikeHost()`** — Detects `localhost`/`127.0.0.1` so the loader can prefer proxy providers while developing locally.
- **`normalizeProviderBaseRaw(provider)`** — Adds protocols and trailing slashes when the config supplies bare hostnames (used by both `normalizeProviderBase` and `createAliasMap`).
- **`onload` / `onerror`** — Script-loaded handlers wired via `loadScript` so CDN probes can log success/failure through `logging.logClient`.

## Examples

```ts
logClient("cdn:probe", { url: testedUrl });
const url = await resolveModuleUrl({ name: "icons/flame", provider: "https://cdn.example.com/" });
```

## Related docs

- `docs/api/bootstrap/cdn/dynamic-modules.md` uses `resolveModuleUrl` to load icons.
- `docs/api/bootstrap/cdn/import-map-init.md` depends on `setFallbackProviders` to mirror `config.json` for the import map.

## Navigation

- [Bootstrap CDN README](README.md)
- [Bootstrap README](../README.md)
