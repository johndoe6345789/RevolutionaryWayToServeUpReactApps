# Example Conflict Resolutions

This document provides concrete examples of how to resolve the merge conflicts in each PR.

## PR #36: Fix lint issues in retro-react-app

**File:** `retro-react-app/src/components/hero-section.tsx`

### Conflict Description

PR #36 imports `ConsoleIcon` from a separate file:
```typescript
import { ConsoleIcon } from "./console-icon";
```

While main has it defined inline:
```typescript
const ConsoleIcon: React.FC<{ text: string }> = ({ text }) => {
  const svgLines = componentPatterns.svg.consoleIcon;
  const svgContent = svgLines.join("\n").replace("{text}", text);
  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};
```

### Resolution Steps

1. Accept PR #36's import (the component is extracted to a separate file)
2. Remove the inline ConsoleIcon definition from main if it still exists
3. Ensure the import statement is correct: `import { ConsoleIcon } from "./console-icon";`
4. Keep all lint fixes from PR #36

### Expected Result

```typescript
"use client";

import { Box, Chip, Typography, Stack, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { ConsoleIcon } from "./console-icon";  // ← From PR #36
import { ComponentLifecycleStatus } from "@/lib/lifecycle-manager";
import type { IReactComponentLifecycle } from "@/lib/lifecycle-manager";
import componentPatterns from "@/lib/component-patterns.json";

// No inline ConsoleIcon here - it's imported

class HeroSectionLifecycle implements IReactComponentLifecycle {
  // ... rest of the code
}
```

---

## PR #37: Move hero section test primitives into shared fixture

**File:** `retro-react-app/src/components/hero-section.tsx`

### Conflict Description

PR #37 restructures test data imports. The conflict is similar to PR #36 regarding the ConsoleIcon.

### Resolution Steps

1. First ensure PR #36 is merged (or apply its changes)
2. Accept the ConsoleIcon import from the earlier resolution
3. Keep any test-related imports or data structures from PR #37
4. Verify the fixture file exists and contains the expected data

### Expected Result

The file should have the same structure as PR #36, plus any additional imports needed for test fixtures.

---

## PR #38: Refactor webui interfaces into dedicated files

**Files:** 
- `codegen/src/specs/webui/types/api-route-spec.ts`
- `codegen/src/webui/components/generated-full-text-search.tsx`
- `codegen/src/webui/components/generated-tree-navigation.tsx`

### Conflict Description

PR #38 moves interfaces to separate files. The conflict occurs when:
- Main has interfaces in one file
- PR #38 has split them into separate files
- Both versions have been modified

### Resolution for `api-route-spec.ts`

**Before (Main):**
```typescript
// Multiple interfaces in one file
export interface APIRouteSpec {
  // ...
}

export interface SchemaSpec {
  // ...
}
```

**After (PR #38):**
```typescript
// Only APIRouteSpec in this file
export interface APIRouteSpec {
  // ...
}
```

With SchemaSpec moved to `schema-spec.ts`.

### Resolution Steps

1. Accept PR #38's file structure (one interface per file)
2. Update all imports in generated components
3. For each interface moved:
   - Verify the new file exists
   - Update import statements
   - Ensure no duplicate definitions

### Expected Changes in Generated Components

**Before:**
```typescript
import { APIRouteSpec, SchemaSpec } from "../specs/webui/types/api-route-spec";
```

**After:**
```typescript
import { APIRouteSpec } from "../specs/webui/types/api-route-spec";
import { SchemaSpec } from "../specs/webui/types/schema-spec";
```

---

## PR #40: Ensure each file exposes a single top-level function

**File:** `retro-react-app/src/components/hero-section.tsx`

### Conflict Description

PR #40 extracts helper functions into separate files. Similar to PR #36, but focuses on functions rather than components.

### Resolution Steps

1. Apply resolutions from PR #36 and #37 first
2. Check if any helper functions exist in the file
3. If helper functions exist:
   - Move them to separate files as PR #40 intends
   - Update imports
4. Ensure only one main export per file

### Example

If there's a helper function in the file:

**Before:**
```typescript
function formatHeroText(text: string): string {
  return text.toUpperCase();
}

export function HeroSection() {
  // uses formatHeroText
}
```

**After:**
```typescript
import { formatHeroText } from "./format-hero-text";

export function HeroSection() {
  // uses formatHeroText
}
```

With `format-hero-text.ts` containing:
```typescript
export function formatHeroText(text: string): string {
  return text.toUpperCase();
}
```

---

## PR #32: Enhance web UI generator outputs

**Files:**
- `codegen/src/specs/webui/generator.test.ts`
- `codegen/src/specs/webui/generator.ts`
- `codegen/src/specs/webui/spec.json`
- `codegen/src/specs/webui/types/component-spec.ts`

### Conflict Description

PR #32 enhances the code generator with new features. Conflicts occur because:
- Main has structural changes from PR #38 (interfaces reorganization)
- PR #32 has functional enhancements

### Resolution for `generator.ts`

**Strategy:**
1. Accept structural changes from main (file organization)
2. Layer PR #32's functional enhancements on top
3. Update import paths if interfaces were moved

**Example:**
```typescript
// Combine imports from both versions
import { ComponentSpec } from "./types/component-spec";
import { APIRouteSpec } from "./types/api-route-spec";  // May have moved
import { SchemaSpec } from "./types/schema-spec";        // May be new location

// Keep generator enhancements from PR #32
export function generateComponent(spec: ComponentSpec): string {
  // Enhanced logic from PR #32
  const props = derivePropsFromSpec(spec);  // New function
  const defaults = deriveDefaultsFromSpec(spec);  // New function
  // ... rest of enhanced logic
}
```

### Resolution for `generator.test.ts`

1. Merge test cases from both versions
2. Update import paths to match resolved `generator.ts`
3. Ensure all new features have tests

### Resolution for `spec.json`

1. Compare JSON structures
2. Merge new fields from PR #32
3. Keep any structural changes from main
4. Validate JSON is well-formed

**Example merge:**
```json
{
  "components": {
    "button": {
      "props": { ... },
      "defaults": { ... },  // New from PR #32
      "callbacks": { ... }  // New from PR #32
    }
  }
}
```

### Resolution for `component-spec.ts`

1. Accept interface organization from main
2. Add new properties from PR #32
3. Update imports if types were split

```typescript
export interface ComponentSpec {
  name: string;
  // Existing fields from main
  props: PropSpec[];
  // New fields from PR #32
  defaults?: Record<string, unknown>;
  callbacks?: CallbackSpec[];
}
```

---

## General Resolution Pattern

For all conflicts:

1. **Identify the nature of the conflict:**
   - Structural (file organization, imports)
   - Functional (logic changes)
   - Style (formatting, lint fixes)

2. **Apply in order:**
   - Structural changes first (accept from main or earlier PRs)
   - Functional changes second (from the current PR)
   - Style changes last (re-run linter if needed)

3. **Test after resolution:**
   ```bash
   npm run lint    # Fix any style issues
   npm run build   # Ensure it compiles
   npm test        # Ensure tests pass
   ```

4. **Common commands:**
   ```bash
   # During conflict resolution
   git checkout --ours <file>    # Keep your branch's version
   git checkout --theirs <file>  # Keep main's version
   git diff --ours --theirs      # See differences
   
   # After manual resolution
   git add <file>
   git commit
   ```

---

## Quick Reference: Conflict Resolution Order

1. ✅ PR #36 (lint fixes) - Simplest, foundation for others
2. ✅ PR #37 (test fixtures) - Depends on #36
3. ✅ PR #40 (one function per file) - Depends on #36, #37
4. ✅ PR #38 (interface refactoring) - Independent, but merge before #32
5. ✅ PR #32 (generator enhancements) - Most complex, should be last

## Validation Checklist

After resolving each PR:

- [ ] All files compile without errors
- [ ] Linter passes with no warnings
- [ ] All tests pass
- [ ] No duplicate code exists
- [ ] All imports are correct
- [ ] Generated code (if any) is up to date
- [ ] Documentation is updated if needed

---

## Need Help?

If you encounter a conflict not covered here:

1. Check the full diff: `git diff main...<branch-name>`
2. Look at the PR description for context
3. Review comments on the original PR
4. Test both versions independently to understand behavior
5. Combine the behaviors thoughtfully
