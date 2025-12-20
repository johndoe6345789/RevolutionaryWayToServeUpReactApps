# Module: `server/server.js`

## Overview

- **Purpose:** Serve the static client bundle, proxy CDN requests, and expose the `/__client-log` endpoint so Playwright/e2e jobs can run the bundle against proxied providers.
- **Entry point:** Starts an Express server that loads logging configuration from `config.json` and exposes proxy middleware for the CDN and ESM endpoints.

## Globals

- _None:_ the file exports a self-starting HTTP server that runs as soon as `server.js` is required.

## Behavior

- Validates every required value under `config.server` (`host`, `port`, `paths`, etc.) so missing configuration fails fast.
- Builds `express.json` middleware with the configured `jsonLimit`, proxies CDN routes via `http-proxy-middleware`, and rewrites the URL so the bootstrap runtime can use `/proxy/*` without leaking the original host.
- Generates `envScriptPath` on demand so the browser can load a tiny script that sets `global.__RWTRA_PROXY_MODE__` before the bootstrap logic runs.
- Logs every incoming request, proxy event, and `clientLogPath` POST using `logLine`, writing to `server.logFile` while also echoing to stdout for visibility.
- Serves static assets from the repo root with caching disabled, and listens for both the CDN and ESM proxies so the layout mirrors how the Docker image runs in production.

## Examples

```sh
node server/server.js
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` describes the `resolveModuleUrl` helpers that are mirrored by this server's proxy mode behavior.

## Navigation

- [Server helpers index](index.md)
- [API reference overview](../index.md)
