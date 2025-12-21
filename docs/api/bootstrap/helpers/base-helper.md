# Module: `bootstrap/helpers/base-helper.js`

## Overview

- **Purpose:** Abstract helper logic so derived helpers can share registry wiring.

## Globals

- _None yet_

## Functions / Classes

- _None yet_

## Examples

```ts
class CustomHelper extends BaseHelper {
  initialize() {
    this._registerHelper("customHelper", this);
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
