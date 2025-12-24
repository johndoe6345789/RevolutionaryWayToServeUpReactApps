# GitHub Actions Library

This directory contains reusable composite actions that can be used across workflows.

## Available Actions

### setup-env

Sets up the basic environment for all CI tasks.

**What it does:**
- Checks out the repository
- Sets up Bun runtime

**Usage:**
```yaml
- name: Setup environment
  uses: ./.github/actions/setup-env
  with:
    bun-version: '1.3.4'  # optional, defaults to 1.3.4
```

### install-deps

Installs dependencies for specified project directories.

**What it does:**
- Installs npm/bun dependencies for one or more projects
- Handles multiple projects in a single step

**Usage:**
```yaml
- name: Install dependencies
  uses: ./.github/actions/install-deps
  with:
    projects: 'codegen,retro-react-app,e2e'  # comma-separated list
```

## Benefits

- **DRY (Don't Repeat Yourself)**: Common setup steps are defined once
- **Consistency**: All workflows use the same setup process
- **Maintainability**: Update setup logic in one place
- **Composability**: Mix and match actions as needed
