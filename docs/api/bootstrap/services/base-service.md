# Module: `bootstrap/services/base-service.js`

## Overview

- **Purpose:** Provides a lifecycle stub that other bootstrap services can extend.

## Globals

- _None yet_

## Functions / Classes

- _None yet_

## Examples

```ts
class CustomService extends BaseService {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
