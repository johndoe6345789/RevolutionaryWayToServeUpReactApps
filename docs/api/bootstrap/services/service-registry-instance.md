# Module: `bootstrap/services/service-registry-instance.js`

## Overview

- **Purpose:** Implement the service registry instance service used by the bootstrap runtime.

## Globals
- `ServiceRegistry`
## Functions / Classes

- _None yet_

## Examples

```ts
serviceRegistry.register("logging", loggingService);
const logging = serviceRegistry.getService("logging");
```

## Related docs

- [Bootstrap API README](../README.md)
