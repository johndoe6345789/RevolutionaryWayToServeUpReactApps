# Module: `bootstrap/services/local/local-loader-service.js`

## Overview

- **Purpose:** Coordinates the initialization steps that stitch the local loader helpers together.

## Globals
- `BaseService`
- `LocalDependencyLoaderConfig`
- `LocalLoaderConfig`
## Functions / Classes

- `LocalLoaderInitializer` — internal coordinator that wires renderer, dependency loader, logging, compilers, and registry bindings.
- `LocalLoaderService` — public service that initializes local helpers and exposes the local loader API.

## Examples

```ts
const service = new LocalLoaderService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
