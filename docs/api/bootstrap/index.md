# Bootstrap Suite

This section documents the bootstrap runtime, CDN helpers, and the loader helpers that power the RetroDeck experience.

## Core reference

- [`core.md`](core.md) – Runtime orchestration, logging, module loading, and the bootstrap entry point.
- [`declarations.md`](declarations.md) – TypeScript signatures for every exposed helper.
- [`env.md`](env.md) – Proxy mode default injected before other bootstrap helpers run.
- [`module-loader.md`](module-loader.md) – Aggregation layer that re-exports CDN, tool, and local helpers.

## CDN helpers

- [`cdn/index.md`](cdn/index.md) – Landing page for the CDN helpers (network, logging, dynamic modules).

## Local tooling

- [`local/index.md`](local/index.md) – Landing page for the local loader plus Sass/TSX compiler helpers.

## Script helpers

- [`script-list-loader.md`](script-list-loader.md) – Loads `bootstrap/script-list.html` so helper scripts can execute in order before `bootstrap.js`.

Use the links above to drill into the specific helpers you are working with.
