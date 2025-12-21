# Module: `bootstrap/services/service-registry.js`

## Overview

- **Purpose:** Track named service instances so other helpers can obtain them without re-importing deeply nested modules.

## Globals

- _None yet_

## Functions / Classes

- _None yet_

## Examples

```ts
const registry = new ServiceRegistry();
registry.register("logging", loggingService);
const logging = registry.getService("logging");
```

## Related docs

- [Bootstrap API README](../README.md)
