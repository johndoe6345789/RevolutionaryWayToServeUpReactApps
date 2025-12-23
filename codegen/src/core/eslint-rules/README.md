# Custom ESLint Rules

This directory contains custom ESLint rules developed for the Revolutionary Codegen project to enforce best practices and prevent common mistakes.

## no-hardcoded-strings

**Purpose**: Prevents the mistake of hardcoding large amounts of configuration or template strings in TypeScript files, promoting better separation of concerns and maintainability.

**What it detects**:
- Template literals with more than 5 lines (configurable)
- Object expressions with more than 3 string properties that look like configuration
- Arrays with more than 5 string elements that appear to be configuration
- Variables named with config-like patterns (config, configs, template, templates, rules, settings)

**Why this matters**: We learned from experience that hardcoding templates and configurations in TypeScript files makes them:
- Difficult to edit (especially for non-developers)
- Not version controlled in a user-friendly way
- Hard to reuse across different parts of the system
- A maintenance burden

**Example violations**:
```typescript
// ❌ Bad: Hardcoded template
const template = `
#!/bin/bash
echo "This is a long template"
with many lines
that should be externalized
`;

// ❌ Bad: Hardcoded configuration
const configs = {
  base: {
    extends: ['@eslint/js'],
    plugins: ['@typescript-eslint'],
    rules: {
      'no-console': 'error',
      // ... many more rules
    }
  }
};
```

**Recommended solution**:
```typescript
// ✅ Good: Load from external JSON
import configData from './configs.json';
import templateData from './templates.json';
```

**Configuration options**:
```json
{
  "maxTemplateLiteralLines": 5,
  "maxStringPropertiesInObject": 3,
  "maxStringArrayLength": 5,
  "ignoreInTests": true
}
```

**When this rule triggers**: The rule successfully detected hardcoded strings in:
- ESLint sync plugin (`standardConfigs` object)
- Bootstrap system generator (large template literals)
- Other places where configuration should be externalized

## no-large-directories

**Purpose**: Enforces good code organization by detecting directories with too many files, suggesting they be split according to the Single Responsibility Principle.

**What it detects**:
- Directories with more than the configured maximum number of files
- Focuses on source files (.ts, .tsx, .js, .jsx, .json, .md)
- Excludes build artifacts, logs, and other generated files

**Why this matters**: Large directories often indicate:
- Violation of Single Responsibility Principle
- Poor code organization
- Difficulty finding and maintaining code
- Monolithic architecture anti-patterns

**Example violations**:
```
src/utils/ (25 files) - exceeds maximum of 15
src/components/legacy/ (30 files) - may indicate need for further organization
```

**Recommended solutions**:
- Split into smaller, more focused directories
- Group related functionality together
- Consider extracting shared code into separate modules
- Follow domain-driven design principles

**Configuration options**:
```json
{
  "maxFiles": 15,
  "excludePatterns": ["node_modules", ".git", "dist", "build"],
  "excludeExtensions": [".log", ".lock", ".map"],
  "includeExtensions": [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]
}
```

## require-readme

**Purpose**: Ensures comprehensive documentation by requiring README files in project directories, promoting good documentation practices and discoverability.

**What it detects**:
- Directories missing README files (README.md, readme.md, or Readme.md)
- Empty or very short README files (configurable minimum length)
- Ensures documentation quality and completeness

**Why this matters**: Good documentation is essential for:
- **Team collaboration** - New team members can understand directory purposes
- **Code maintenance** - Future developers know what each directory contains
- **Project discoverability** - Clear documentation of functionality and purpose
- **Professional standards** - Well-documented codebases are more maintainable

**Example violations**:
```
Directory "src/utils" is missing a README file. Please add README.md to document this directory.
README file "src/components/README.md" is too short (25 characters, minimum 50). Please add more comprehensive documentation.
```

**Recommended solutions**:
- Add descriptive README files explaining directory purpose
- Include usage examples and API documentation
- Document important design decisions or patterns
- Keep documentation current with code changes

**Configuration options**:
```json
{
  "requireInRoot": true,
  "requireInSubdirs": false,
  "readmeNames": ["README.md", "readme.md", "Readme.md"],
  "excludePatterns": ["node_modules", ".git", "dist", "build"],
  "minContentLength": 50,
  "checkContent": true
}
```

**Usage**: All three rules run automatically as part of the project's linting process and help maintain comprehensive code quality, documentation, and organizational standards across the codebase.

## Additional JSDoc Rules

The project also uses `eslint-plugin-jsdoc` for comprehensive JSDoc documentation enforcement:

- `jsdoc/require-jsdoc` - Requires JSDoc comments on classes, interfaces, and methods
- `jsdoc/require-param` - Requires @param documentation for method parameters
- `jsdoc/require-returns` - Requires @return documentation for non-void methods
- `jsdoc/require-throws` - Requires @throws documentation for methods with throw statements

These rules ensure proper API documentation and are configured to exclude constructors, getters, and setters for cleaner code.
