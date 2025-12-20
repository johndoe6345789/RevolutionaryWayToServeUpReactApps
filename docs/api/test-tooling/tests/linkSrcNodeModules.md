# Module: `test-tooling/tests/linkSrcNodeModules.js`

## Overview

- **Purpose:** Mirror the runtime `src/` directory into Jest’s sandboxed `node_modules` so module paths resolve identically inside tests.
- **Entry point:** Run before the Jest suite (`setupFilesAfterEnv`) to create symlinks that match the module aliases used in production.

## Behavior

- Copies `src/` helpers into `test-tooling/tests/__mocks__/src` if they are missing, ensuring `bootstrap/initializers/loaders/local-loader.js` still finds components when Jest executes.
- Logs replaced files under `test-tooling/tests/.log` for troubleshooting.

## Navigation

- [Testing overview](../../README.md)
