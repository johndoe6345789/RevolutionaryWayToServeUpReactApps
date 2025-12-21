# Module: `bootstrap/controllers/base-controller.js`

## Overview

- **Purpose:** Provides a lightweight lifecycle guard shared by bootstrap controllers.

## Globals

- _None yet_

## Functions / Classes

- _None yet_

## Examples

```ts
class CustomController extends BaseController {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
