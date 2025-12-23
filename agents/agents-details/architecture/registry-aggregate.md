# Registry/Aggregate Structure (MANDATORY)

### Hierarchical Tree
```
RootAggregate (AppAggregate)
├── DomainAggregate
│   └── [business logic registries]
├── AdaptersAggregate
│   ├── CLIRegistry
│   └── WebUIRegistry
├── CodegenAggregate
│   ├── LanguagesRegistry
│   ├── SnippetsRegistry
│   └── TemplatesRegistry
├── I18nAggregate
│   └── MessageKeysRegistry
└── ToolingAggregate
    ├── PackageManagersRegistry
    ├── BuildSystemsRegistry
    ├── DevWorkflowRegistry
    ├── QARegistry
    ├── SDKRegistry
    ├── AppsRegistry
    └── ProfilesRegistry
```

### Requirements
- Every tool/profile/template/snippet reachable from root via typed path
- Drill-down navigation: `list_children()` → `get_child(id)` → recurse
- All registries immutable after construction at composition root
- Dependency injection (no singletons)
