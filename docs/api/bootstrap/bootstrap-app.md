# Module: `bootstrap/bootstrap-app.js`

## Overview

- **Purpose:** Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.

## Globals
- `BaseBootstrapApp`
- `Bootstrapper`
- `BootstrapperConfig`
- `LoggingManager`
- `LoggingManagerConfig`
## Functions / Classes

- _None yet_

## Examples

```ts
const app = new BootstrapApp();
app.initialize();
app.installLogging(window);
app.runBootstrapper(window);
```

## Related docs

- [Bootstrap API README](../README.md)
