# Plugin System Architecture (MANDATORY)

### Core Principle
**Core codegen is not much without plugins.** The core provides infrastructure; plugins provide capabilities. This enables:
- Independent development and testing of tools
- Clean separation of concerns
- Easy addition/removal of tools
- Third-party plugin support
- Granular dependency management

### Plugin Discovery and Loading (MANDATORY)

#### Plugin Structure
```
plugins/
├── core/                           # Core infrastructure plugins (shipped with codegen)
│   ├── registry-system/
│   │   ├── plugin.json
│   │   ├── src/
│   │   └── tests/
│   └── search-engine/
│       ├── plugin.json
│       ├── src/
│       └── tests/
├── tools/                          # Tool plugins (one per tool)
│   ├── git/
│   │   ├── plugin.json            # Plugin manifest
│   │   ├── spec.json              # Tool spec (UUID, search metadata, commands)
│   │   ├── messages.json          # i18n message keys
│   │   ├── src/                   # Plugin implementation
│   │   │   ├── git_plugin.py      # Main plugin class
│   │   │   ├── installers/        # Platform-specific installers
│   │   │   │   ├── linux.py
│   │   │   │   ├── macos.py
│   │   │   │   └── windows.py
│   │   │   └── validators/        # Verification logic
│   │   │       └── version_check.py
│   │   ├── tests/                 # Full test suite (MANDATORY)
│   │   │   ├── test_spec.py
│   │   │   ├── test_installers.py
│   │   │   ├── test_validators.py
│   │   │   └── test_integration.py
│   │   └── README.md              # Plugin documentation
│   ├── docker/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── messages.json
│   │   ├── src/
│   │   │   ├── docker_plugin.py
│   │   │   ├── installers/
│   │   │   │   ├── linux.py       # Docker Engine, Docker CE
│   │   │   │   ├── macos.py       # Docker Desktop, Colima, Rancher Desktop
│   │   │   │   └── windows.py     # Docker Desktop
│   │   │   ├── validators/
│   │   │   │   ├── daemon_check.py
│   │   │   │   └── version_check.py
│   │   │   └── config/
│   │   │       └── daemon_json.py  # Docker daemon configuration
│   │   ├── tests/
│   │   └── README.md
│   ├── docker-compose/
│   │   ├── plugin.json
│   │   ├── spec.json              # Both v1 (Python) and v2 (plugin) variants
│   │   ├── messages.json
│   │   ├── src/
│   │   └── tests/
│   ├── podman/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   └── tests/
│   ├── kubectl/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── messages.json
│   │   ├── src/
│   │   │   ├── kubectl_plugin.py
│   │   │   ├── installers/
│   │   │   └── validators/
│   │   ├── tests/
│   │   └── README.md
│   ├── github-actions-runner/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── runner_plugin.py
│   │   │   ├── installers/
│   │   │   └── config/
│   │   ├── tests/
│   │   └── README.md
│   ├── jenkins/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── jenkins_plugin.py
│   │   │   ├── installers/
│   │   │   └── config/
│   │   ├── tests/
│   │   └── README.md
│   ├── gitlab-runner/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── runner_plugin.py
│   │   │   ├── installers/
│   │   │   └── config/
│   │   ├── tests/
│   │   └── README.md
│   ├── argocd/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── argocd_plugin.py
│   │   │   ├── installers/
│   │   │   └── config/
│   │   ├── tests/
│   │   └── README.md
│   ├── terraform/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── terraform_plugin.py
│   │   │   ├── installers/
│   │   │   └── validators/
│   │   ├── tests/
│   │   └── README.md
│   ├── ansible/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   └── tests/
│   ├── buildx/
│   │   ├── plugin.json
│   │   ├── spec.json              # Docker buildx plugin
│   │   ├── src/
│   │   └── tests/
│   ├── trivy/
│   │   ├── plugin.json
│   │   ├── spec.json              # Container security scanning
│   │   ├── src/
│   │   └── tests/
│   └── [...]                      # One directory per tool
├── languages/                      # Language generator plugins
│   ├── typescript/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── templates/
│   │   ├── src/
│   │   └── tests/
│   ├── python/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── templates/
│   │   ├── src/
│   │   └── tests/
│   └── rust/
│       ├── plugin.json
│       ├── spec.json
│       ├── templates/
│       ├── src/
│       └── tests/
├── templates/                      # Project template plugins
│   ├── nextjs-app/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   ├── src/
│   │   └── tests/
│   ├── flask-api/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   ├── src/
│   │   └── tests/
│   └── [...]                       # More templates
└── profiles/                       # Profile plugins
    ├── fullstack-dev/
    │   ├── plugin.json
    │   ├── spec.json
    │   ├── src/
    │   └── tests/
    └── [...]                       # More profiles
```

### Plugin Manifest (plugin.json) - MANDATORY

Every plugin MUST have a `plugin.json` manifest:

```json
{
  "uuid": "RFC-4122-string",
  "id": "plugin.tools.git",
  "version": "1.0.0",
  "type": "tool",
  "name": "Git Plugin",
  "description": "Distributed version control system",
  "author": "Codegen Team",
  "license": "MIT",
  "entry_point": "src/git_plugin.py:GitPlugin",
  "spec_file": "spec.json",
  "messages_file": "messages.json",
  "dependencies": {
    "core": ">=1.0.0",
    "plugins": []
  },
  "platforms": {
    "win": true,
    "mac": true,
    "linux": true
  },
  "registries": [
    "DevWorkflowRegistry"
  ],
  "capabilities": [
    "install",
    "verify",
    "execute",
    "help"
  ],
  "tests": {
    "directory": "tests/",
    "coverage_required": 100
  }
}
```

### Plugin Contract (MANDATORY)

Every plugin MUST implement the `Plugin` interface:

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Any

class Plugin(ABC):
    """Base plugin interface. All plugins must extend this."""
    
    @abstractmethod
    def initialise(self) -> None:
        """Initialize plugin resources, validate dependencies."""
        pass
    
    @abstractmethod
    def get_spec(self) -> Dict[str, Any]:
        """Return the plugin's spec record (from spec.json)."""
        pass
    
    @abstractmethod
    def register(self, registry_manager: 'RegistryManager') -> None:
        """Register this plugin's components with appropriate registries."""
        pass
    
    # Optional: ≤5 public methods total
    def shutdown(self) -> None:
        """Cleanup plugin resources."""
        pass
```

### Plugin Loading Process

1. **Discovery Phase**
   - Core scans `plugins/` directory recursively
   - Locates all `plugin.json` manifests
   - Validates manifest schema
   - Checks dependencies

2. **Dependency Resolution**
   - Build dependency graph
   - Topological sort for load order
   - Fail if circular dependencies detected

3. **Loading Phase**
   - Load plugins in dependency order
   - Call `initialise()` on each plugin
   - Collect spec records
   - Register components with registries

4. **Validation Phase**
   - Verify all UUIDs are unique
   - Verify all IDs are unique within registry scope
   - Verify all required capabilities are present
   - Verify all message keys are defined

### Plugin Types (MANDATORY Categories)

#### 1. Tool Plugins (`plugins/tools/`)
One plugin per tool. Each MUST provide:
- `spec.json`: Tool spec with install/verify/help/oneLiners
- `messages.json`: i18n message keys
- Platform-specific installer implementations
- Validation logic
- Full test suite

**Example: Git Plugin Structure**
```
plugins/tools/git/
├── plugin.json
├── spec.json              # Tool spec with UUID, commands, risks
├── messages.json          # msg.tool.git.*
├── src/
│   ├── git_plugin.py      # Main Plugin implementation
│   ├── installers/
│   │   ├── __init__.py
│   │   ├── linux.py       # apt, snap installers
│   │   ├── macos.py       # brew installer
│   │   └── windows.py     # choco, winget installers
│   └── validators/
│       ├── __init__.py
│       └── version_check.py
├── tests/
│   ├── __init__.py
│   ├── test_spec_valid.py
│   ├── test_linux_install.py
│   ├── test_macos_install.py
│   ├── test_windows_install.py
│   ├── test_verification.py
│   └── test_integration.py
└── README.md
```

#### 2. Language Plugins (`plugins/languages/`)
Code generators for target languages. Each MUST provide:
- Language spec (syntax rules, conventions)
- Template system
- Code generation logic
- Full test suite with golden files

#### 3. Template Plugins (`plugins/templates/`)
Project scaffolding templates. Each MUST provide:
- Template spec (files, structure, variables)
- Template files
- Generation logic
- Full test suite

#### 4. Profile Plugins (`plugins/profiles/`)
User/project profiles with overrides. Each MUST provide:
- Profile spec (overrides, features, preferences)
- Validation logic
- Full test suite

### Plugin Registry Integration (MANDATORY)

Plugins register themselves with appropriate registries:

```python
class GitPlugin(Plugin):
    def register(self, registry_manager: RegistryManager) -> None:
        """Register Git tool with DevWorkflowRegistry."""
        spec = self.get_spec()
        
        # Create tool component from spec
        tool = Tool.from_spec(spec)
        
        # Register in appropriate registry
        registry_manager.get_registry("DevWorkflowRegistry").register(
            id=spec["id"],
            uuid=spec["uuid"],
            component=tool
        )
```

### Plugin Testing Requirements (MANDATORY)

Every plugin MUST have:

#### 1. Spec Validation Tests
```python
def test_plugin_spec_valid():
    """Verify plugin spec is valid and complete."""
    plugin = GitPlugin()
    spec = plugin.get_spec()
    
    assert spec["uuid"] is not None
    assert validate_uuid(spec["uuid"])
    assert spec["id"] == "tool.dev.git"
    assert "search" in spec
    assert "platforms" in spec
    assert "install" in spec
```

#### 2. Platform-Specific Tests
```python
@pytest.mark.parametrize("platform", ["linux", "mac", "win"])
def test_install_commands_exist(platform):
    """Verify install commands defined for all platforms."""
    plugin = GitPlugin()
    spec = plugin.get_spec()
    
    assert platform in spec["platforms"]
    if spec["platforms"][platform]:
        assert platform in spec["install"]
```

#### 3. Integration Tests
```python
def test_plugin_registers_correctly():
    """Verify plugin registers with correct registry."""
    plugin = GitPlugin()
    registry_manager = RegistryManager()
    
    plugin.initialise()
    plugin.register(registry_manager)
    
    registry = registry_manager.get_registry("DevWorkflowRegistry")
    tool = registry.get("tool.dev.git")
    
    assert tool is not None
    assert tool.id == "tool.dev.git"
```

#### 4. Message Key Tests
```python
def test_all_message_keys_defined():
    """Verify all referenced message keys are defined."""
    plugin = GitPlugin()
    spec = plugin.get_spec()
    messages = plugin.get_messages()
    
    # Check oneLiner descriptions
    for oneliner in spec.get("oneLiners", []):
        assert oneliner["description"] in messages
    
    # Check option descriptions
    for option in spec.get("options", []):
        assert option["description"] in messages
```

#### 5. Coverage Requirement
- **100% coverage MANDATORY** for all plugin code
- No exceptions
- CI must enforce this per plugin

### Plugin Development Workflow

#### Creating a New Tool Plugin

1. **Create Plugin Directory Structure**
   ```bash
   mkdir -p plugins/tools/newtool/{src,tests}
   ```

2. **Create plugin.json**
   ```json
   {
     "uuid": "generate-new-uuid-here",
     "id": "plugin.tools.newtool",
     "version": "1.0.0",
     "type": "tool",
     "entry_point": "src/newtool_plugin.py:NewToolPlugin",
     "spec_file": "spec.json",
     "messages_file": "messages.json"
   }
   ```

3. **Create spec.json**
   ```json
   {
     "uuid": "tool-uuid-here",
     "id": "tool.dev.newtool",
     "type": "tool",
     "search": {...},
     "platforms": {...},
     "install": {...},
     "verify": {...}
   }
   ```

4. **Create messages.json**
   ```json
   {
     "msg.tool.newtool.title": {"en": "New Tool"},
     "msg.tool.newtool.summary": {"en": "Description"}
   }
   ```

5. **Implement Plugin Class**
   ```python
   from codegen.core.plugin import Plugin
   import json
   
   class NewToolPlugin(Plugin):
       def initialise(self) -> None:
           # Load spec and messages
           pass
       
       def get_spec(self) -> dict:
           with open("spec.json") as f:
               return json.load(f)
       
       def register(self, registry_manager) -> None:
           # Register with appropriate registry
           pass
   ```

6. **Write Tests**
   - Test spec validity
   - Test platform commands
   - Test registration
   - Test message keys
   - Achieve 100% coverage

7. **Verify Plugin Loads**
   ```bash
   codegen plugin list
   codegen plugin describe plugin.tools.newtool
   codegen plugin test plugin.tools.newtool
   ```

### Plugin Commands (CLI)

Core MUST provide plugin management commands:

```bash
# List all plugins
codegen plugin list [--type=tool|language|template|profile]

# Describe plugin
codegen plugin describe <plugin-id>

# Test plugin
codegen plugin test <plugin-id>

# Validate plugin
codegen plugin validate <plugin-id>

# Enable/disable plugin
codegen plugin enable <plugin-id>
codegen plugin disable <plugin-id>

# Install third-party plugin
codegen plugin install <path-or-url>

# Uninstall plugin
codegen plugin uninstall <plugin-id>
```

### Plugin Isolation (MANDATORY)

Plugins MUST be isolated:
- Each plugin has own namespace
- Plugins cannot directly access other plugins
- Communication via registry system only
- No shared mutable state
- Dependencies declared explicitly in manifest

### Plugin Versioning (MANDATORY)

Plugins follow semver (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes to plugin API
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

Core checks version compatibility:
```json
{
  "dependencies": {
    "core": ">=1.0.0,<2.0.0",
    "plugins": [
      "plugin.tools.git@^1.0.0"
    ]
  }
}
```

### Third-Party Plugin Support

#### Plugin Distribution
Plugins can be distributed as:
- Git repositories
- Tar/zip archives
- Plugin registry (future)

#### Plugin Installation
```bash
# From local directory
codegen plugin install ./my-plugin/

# From git repository
codegen plugin install https://github.com/user/plugin-newtool.git

# From archive
codegen plugin install ./plugin-newtool.tar.gz
```

#### Plugin Validation
Before installation, core MUST:
- Validate manifest schema
- Check UUID uniqueness
- Verify required files exist
- Run plugin tests
- Check security/safety constraints
