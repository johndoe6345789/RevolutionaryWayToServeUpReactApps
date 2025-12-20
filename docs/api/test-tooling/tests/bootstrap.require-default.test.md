# Module: `test-tooling/tests/bootstrap.require-default.test.ts`

## Overview

- **Purpose:** Ensure the default export from `bootstrap/initializers/loaders/local-loader.js` cooperates with `_async` and the CDN registry when test suites pull the loader.
- **Entry point:** Requires the local loader, invokes `createRequire`, and verifies `_async` proxies requests to the CDN helper (`loadDynamicModule`) as expected.

## Assertions

- Asserts that the loader exposes `_async` and resolves dependencies via the `helpers.dynamicModules` registry.
- Confirms the default export reuses the same cache to avoid repeated compilation.

## Navigation

- [Testing overview](../../README.md)
