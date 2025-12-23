# CLI (MANDATORY)

### Commands
Must expose drill-down UX:

```bash
# Listing and navigation
codegen list                          # List top-level aggregates
codegen list tooling                  # List tooling registries
codegen list tooling.package-managers # List package managers

# Description and search
codegen describe tool.dev.git         # Show tool details
codegen describe <uuid>               # Lookup by UUID
codegen search "version control"      # Full-text search

# Execution
codegen tool install git              # Install tool
codegen tool install git --profile=fullstack-dev
codegen tool verify git               # Verify installation
codegen tool run git clone <url>      # Execute tool

# Runbook operations
codegen runbook generate --profile=fullstack-dev --platform=linux
codegen runbook export --format=markdown --output=setup.md

# Profile management
codegen profile list                  # List profiles
codegen profile show fullstack-dev    # Show profile details
codegen profile apply fullstack-dev   # Set active profile

# Initialization (if explicit phase exposed)
codegen init tooling --profile=fullstack-dev

# Schema operations
codegen schema generate <type> --bulk --defaults  # Bulk generate schema bits with sensible defaults
```

### CLI Must Be Generated
- Command structure derived from registries
- Help text from message keys (i18n-ready)
- Auto-completion hints generated
- Platform-aware (adapts to OS)
