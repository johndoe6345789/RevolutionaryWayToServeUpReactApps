# Module: `bootstrap/cdn/logging.js`

## Overview

- **Purpose:** Provide CI-aware client logging for the bootstrap runtime and CDN tooling so telemetry can be captured when needed without flooding the production console.
- **Entry point:** Exposed on `__rwtraBootstrap.helpers.logging` so both browser entry points and server-side tools can call `logClient` and coordinate `ciLogging` decisions.

## Globals
- `BaseEntryPoint`
- `LoggingService`
- `LoggingServiceConfig`
- `loggingService`
## Functions

- **`setCiLoggingEnabled(enabled)`** — Toggles logging so `logClient` only sends data when CI logging is explicit (or when developer flags enable it).
- **`detectCiLogging(config, locationOverride)`** — Reads `window.__RWTRA_CI_MODE__`, the `ci` query parameter, or the host name (`localhost`/`127.0.0.1`) to decide whether the runtime should treat the session as CI; falls back to `config.ciLogging` when provided.
- **`logClient(event, detail, level = "info")`** — Sends serialized payloads to `/__client-log` via `navigator.sendBeacon` or `fetch`, writes to the console, and obeys the `ciLogging` flag so only important messages ship.
- **`wait(ms)`** — Helper used by tests and tooling for backoff delays when `logClient` needs to wait before retrying.
- **`serializeForLog(value)`** — Normalizes `Error` objects and other payloads so the bootstrap logger can round-trip the details safely.
- **`isCiLoggingEnabled()`** — Reports whether CI logging is currently enabled so callers can gate downstream telemetry.

- `configFactory`
## Examples

```ts
if (detectCiLogging(config)) {
  setCiLoggingEnabled(true);
  logClient("bootstrap:start", { config });
}
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` and `docs/api/bootstrap/cdn/tools.md` emit events that `logClient` surfaces, providing useful context in CI logs.

## Navigation

- [Bootstrap CDN README](README.md)
- [Bootstrap README](../README.md)
