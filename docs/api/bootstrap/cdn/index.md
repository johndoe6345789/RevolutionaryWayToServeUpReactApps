# CDN helpers

This folder holds the helper scripts that talk to CDNs, log bootstrap events, and hydrate dynamic modules so the loader can request remote assets without bundling everything ahead of time.

## Documents

- [`dynamic-modules.md`](dynamic-modules.md) – Resolves dynamic module URLs, preloads icons, and normalizes CDN fallbacks before the UI renders.
- [`import-map-init.md`](import-map-init.md) – Populates the runtime import map by fetching `config.json` and wiring up the CDN helpers with the resolved providers.
- [`logging.md`](logging.md) – Tracks CI-friendly log delivery, serializes event data, and ships errors back to the server endpoint when requested.
- [`network.md`](network.md) – Probes CDN endpoints, resolves module URLs, and manages provider fallbacks for both direct and proxied modes.
- [`source-utils.md`](source-utils.md) – Scans source files for imports, preloads dynamic dependencies, and exposes helpers for executing source strings inside the loader.
- [`tools.md`](tools.md) – Loads external helper globals, converts them into namespaces, and wires them into the module registry that the bootstrap runtime depends on.

## Navigation

- [Bootstrap index](../index.md)
- [API reference overview](../../index.md)
