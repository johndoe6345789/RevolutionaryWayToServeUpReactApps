# Module: `bootstrap/controllers/bootstrapper.js`

## Overview

- **Purpose:** Drives the overall bootstrap workflow (config, module loading, rendering, logging).

## Globals
- `BaseController`
- `BootstrapperConfig`
- `GlobalRootHandler`
- `hasDocument`
- `hasWindow`
- `rootHandler`
## Functions / Classes

- _None yet_

## Examples

```ts
const bootstrapper = new Bootstrapper(new BootstrapperConfig({
  logging,
  network,
  moduleLoader,
}));
bootstrapper.initialize();
bootstrapper.bootstrap();
```

## Related docs

- [Bootstrap API README](../README.md)
