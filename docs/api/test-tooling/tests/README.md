# Jest tooling

This document outlines the Jest-driven unit suite housed inside `test-tooling/tests/`. Each file plays a role in validating the App shell, bootstrap, and loader helpers.

## Modules

- `test-tooling/tests/App.test.tsx` – Renders `src/App.tsx` with React Testing Library to ensure the hero, featured grid, and footer mount.
- `test-tooling/tests/bootstrap.test.ts` – Exercises `bootstrap/bootstrap.js` helpers (`bootstrap()`, `loadModules()`) under mocked CDN helper responses.
- `test-tooling/tests/bootstrap.cdn.test.ts` – Targets CDN exports (`logging`, `network`, `tools`) to ensure `resolveModuleUrl`, `loadTools`, and logging behave under failure/retry scenarios.
- `test-tooling/tests/bootstrap.require-default.test.ts` – Verifies `bootstrap/initializers/loaders/local-loader.js` exposes a default `_async` loader that cooperates with the CDN registry.
- `test-tooling/tests/components.test.tsx` – Mounts `HeroSection`, `FeaturedGames`, and `FooterStrip` to confirm UI sections render the configured theme/data.
- `test-tooling/tests/data.test.ts` – Confirms `src/data.ts` exports `FEATURED_GAMES`, `SYSTEM_TAGS`, and `CTA_BUTTON_STYLE` with the expected metadata.
- `test-tooling/tests/local-paths.test.ts` – Covers path helpers (`isLocalModule`, `normalizeDir`, `getCandidateLocalPaths`).
- `test-tooling/tests/proxy-mode.test.ts` – Ensures `bootstrap/cdn/network.js` proxy normalization honors defaults, env overrides, and host heuristics.
- `test-tooling/tests/global.d.ts` – Registers `__rwtraBootstrap`, `_async`, and other globals so Jest compiles the tests.
- `test-tooling/tests/linkSrcNodeModules.js` – Mirrors `src/` into Jest’s sandbox so module resolution stays consistent.
- `test-tooling/tests/setupBun.ts` – Prepares Bun-specific globals before the suite runs.
- `test-tooling/tests/setupTests.ts` – Re-exports React Testing Library helpers so matchers like `toBeInTheDocument` are available.

## Navigation

- [API reference overview](../../README.md)
