# Module: `bootstrap/helpers/helper-registry.js`

## Overview

- **Purpose:** Tracks reusable helper constructors so they can be shared across services.

## Globals

- _None yet_

## Functions / Classes

- _None yet_

## Examples

```ts
const registry = new HelperRegistry();
registry.register("renderer", ExampleHelper);
const renderer = registry.getHelper("renderer");
```

## Related docs

- [Bootstrap API README](../README.md)
