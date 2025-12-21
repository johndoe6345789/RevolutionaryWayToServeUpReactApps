# Module: `bootstrap/entrypoints/base-entrypoint.js`

## Overview

- **Purpose:** Consolidates the repetitive entrypoint wiring for bootstrap services/helpers.

## Globals
- `GlobalRootHandler`
- `serviceRegistry`
## Functions / Classes
- `configFactory`
## Examples

```ts
const entrypoint = new BaseEntryPoint({
  ServiceClass,
  ConfigClass,
});
entrypoint.run();
```

## Related docs

- [Bootstrap API README](../README.md)
