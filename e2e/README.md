# End-to-end tests

Playwright-based regression tests for the app. This package uses Bun and `start-server-and-test` to boot the server and then run the browser suite.

## Running locally

```bash
cd e2e
bun install          # installs playwright and dependencies
bun run test         # boots the app defined in ../config.json and runs the Playwright specs
```

`run-e2e.js` reads `config.json` at the repo root to decide which host/port to target, then proxies to `bun x playwright test` after the app is up.

## Layout

- `tests/` – individual Playwright specs (navigation, responsiveness, theming, language switching, etc.).
- `playwright.config.ts` – shared Playwright settings.
- `Dockerfile` – container image used in CI for reproducible test runs.

Keep new specs under `tests/` and ensure they work headlessly so they can run in CI.
