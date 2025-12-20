# Module documentation template

> Replace the placeholders below as you author the markdown for a single JS/TS module.

## Module: `test-tooling/tests/proxy-mode.test.ts`

### Overview

- **Purpose:** Summarize what this module does and which subsystem it belongs to.
- **Entry point:** Mention the default export if any, or how consumers should import it.

### Globals

| Name | Description | Example usage |
| --- | --- | --- |
| `<GLOBAL_NAME>` | Describe the value and how it is intended to be consumed. | ````<code around usage>```` |

_Add rows for every top-level constant/variable that should be documented._

### Functions / Classes

| Name | Signature | Description |
| --- | --- | --- |
| `<exportedFunction>` | ````<params> -> <return>```` | Explain side effects, optional parameters, and how it fits with other helpers. |

- Call out whether the function is synchronous, asynchronous, or meant for bootstrapping.
- If the module exposes a class, describe its public properties and methods here with the same table format.

### Examples

```ts
// Show a minimal reproducible snippet using the module so readers can copy/paste.
```

### Related docs

- Link any other markdown reference or guide that mentions this module (e.g., `docs/guide.md` or the digital twin entry once it exists).
