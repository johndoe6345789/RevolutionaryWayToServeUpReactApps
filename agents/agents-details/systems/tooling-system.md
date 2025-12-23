# Tooling System (God Tool Capabilities)

### Tool Record Structure (MANDATORY)
```json
{
  "uuid": "RFC-4122-string",
  "id": "tool.category.name",
  "type": "tool",
  "search": {
    "title": "Git",
    "summary": "Distributed version control system",
    "keywords": ["vcs", "git", "version-control"],
    "tags": ["dev-workflow", "essential"],
    "aliases": ["source-control"],
    "domain": "tooling",
    "capabilities": ["clone", "commit", "push", "pull"]
  },
  "platforms": {
    "win": true,
    "mac": true,
    "linux": true
  },
  "install": {
    "linux": {
      "apt": ["apt-get", "install", "-y", "git"],
      "snap": ["snap", "install", "git"]
    },
    "mac": {
      "brew": ["brew", "install", "git"]
    },
    "win": {
      "choco": ["choco", "install", "git", "-y"],
      "winget": ["winget", "install", "Git.Git"]
    }
  },
  "verify": {
    "linux": ["git", "--version"],
    "mac": ["git", "--version"],
    "win": ["git", "--version"]
  },
  "help": {
    "linux": ["git", "--help"],
    "mac": ["git", "--help"],
    "win": ["git", "--help"]
  },
  "oneLiners": [
    {
      "id": "clone-repo",
      "description": "msg.tool.git.oneliner.clone",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["git", "clone", "{repo_url}"]
    }
  ],
  "options": [
    {
      "flag": "--verbose",
      "description": "msg.tool.git.opt.verbose",
      "platforms": {"win": true, "mac": true, "linux": true}
    }
  ],
  "dependencies": [],
  "risks": {
    "destructive": false,
    "network": true,
    "confirmation": "msg.tool.git.risk.network"
  }
}
```

### Tool Categories (Initial Coverage)
Must support with dedicated registries:

1. **Package Managers**: apt, dpkg, snap, brew, choco, winget, scoop, pip, venv, poetry, npm, yarn, pnpm, bun, conan, vcpkg, gradle, maven, cargo
2. **Build Systems**: make, cmake, ninja, Xcode toolchain, MSVC toolchain (vswhere), Android SDK, msbuild, bazel, buck2
3. **Linting & Code Quality** (MANDATORY):
   - **Multi-Language**: editorconfig, prettier (multi-lang formatter)
   - **JavaScript/TypeScript**: eslint, tslint (legacy), typescript-eslint, oxlint (fast Rust-based)
   - **Python**: pylint, flake8, black, ruff (fast Rust-based), mypy, pyright, bandit (security)
   - **Rust**: rustfmt, clippy, cargo-audit
   - **Go**: golangci-lint, gofmt, go vet, staticcheck
   - **C/C++**: clang-format, clang-tidy, cppcheck, cpplint
   - **Java/Kotlin**: checkstyle, spotbugs, pmd, ktlint, detekt
   - **C#**: roslyn analyzers, stylecop, resharper inspections
   - **Ruby**: rubocop, reek, brakeman (security)
   - **PHP**: phpcs, phpstan, psalm, php-cs-fixer
   - **Shell Scripts**: shellcheck, shfmt
   - **YAML**: yamllint
   - **JSON**: jsonlint
   - **Markdown**: markdownlint, remark-lint
   - **Dockerfile**: hadolint
   - **SQL**: sqlfluff, pg_format
   - **HTML/CSS**: htmlhint, stylelint
   - **GraphQL**: graphql-eslint
4. **Dev Workflow**: git, GitHub CLI, GitLab CLI, curl, wget, rsync, ssh, telnet, nmap, rm, cp, mv, nano, vim, emacs, vscode, cline, codex
5. **Test/QA**: jest, vitest, pytest, unittest, mocha, jasmine, playwright, puppeteer, selenium, cypress, coverage tools, chrome automation
6. **Runtimes/SDKs**: flask, django, fastapi, nextjs, react, vue, angular, svelte, Vulkan SDK, SDL3, JDK, Android, Python, Node, Deno, Bun, Go, Rust, .NET
7. **CI/CD Systems**:
   - **CI Platforms**: Jenkins, GitHub Actions, GitLab CI, CircleCI, Travis CI, Azure Pipelines, Bamboo, TeamCity, Drone CI, Buildkite, Concourse CI
   - **CD/Deployment**: ArgoCD, Flux, Spinnaker, Octopus Deploy, Harness, AWS CodeDeploy, Google Cloud Deploy
   - **Pipeline Tools**: Tekton, Jenkins X, GoCD, Screwdriver
8. **Container & Orchestration**:
   - **Container Runtimes**: docker, podman, containerd, cri-o, lxc, lxd
   - **Container Registries**: Docker Hub, GitHub Container Registry (ghcr), Amazon ECR, Google Container Registry (gcr), Azure Container Registry, Harbor, Quay, JFrog Artifactory
   - **Orchestration**: kubernetes (kubectl), k3s, k3d, minikube, kind, microk8s, rancher, openshift
   - **Service Mesh**: istio, linkerd, consul, envoy
   - **Container Tools**: docker-compose, kompose, skaffold, tilt, devspace, telepresence
9. **Docker Variations & Tools**:
   - **Docker Editions**: Docker Desktop, Docker Engine, Docker CE, Docker EE, Colima (macOS), Rancher Desktop
   - **Docker Build Tools**: buildx, buildkit, kaniko, buildah, img, makisu
   - **Docker Compose Variants**: docker-compose (Python), docker compose (v2 plugin), podman-compose
   - **Docker Security**: trivy, clair, anchore, snyk, docker-bench-security, hadolint
   - **Docker Monitoring**: portainer, lazydocker, ctop, dive (image analyzer), dry
   - **Docker Networking**: weave, flannel, calico (for docker)
10. **Infrastructure as Code**:
   - **Provisioning**: terraform, terragrunt, pulumi, crossplane, opentofu
   - **Configuration**: ansible, chef, puppet, saltstack
   - **Cloud Formation**: AWS CloudFormation, Azure ARM Templates, Google Deployment Manager
11. **Apps**: discord, slack, IRC, steam, Epic Games, GOG Galaxy, RSI launcher, Meta Quest Link, Keeper, 1Password, Bitwarden

### Profile System
Profiles override defaults per user/project:
```json
{
  "uuid": "...",
  "id": "profile.fullstack-dev",
  "type": "profile",
  "search": {
    "title": "Full-Stack Developer",
    "summary": "Web + mobile development profile",
    "keywords": ["web", "mobile", "fullstack"],
    "domain": "tooling"
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "overrides": {
    "preferredPackageManager": {
      "linux": "apt",
      "mac": "brew",
      "win": "winget"
    },
    "toolVersions": {
      "tool.dev.node": "20.x",
      "tool.dev.python": "3.11"
    },
    "features": {
      "docker": true,
      "android": false
    },
    "workspaceRoot": "~/dev",
    "preferredEditor": "vscode"
  }
}
```

### Download & Cache System (MANDATORY)
- MUST download missing tools/artifacts from network
- Cache in OS-appropriate locations:
  - **Linux**: `XDG_CACHE_HOME`, `XDG_DATA_HOME`
  - **macOS**: `~/Library/Application Support`, `~/Library/Caches`
  - **Windows**: `%APPDATA%`, `%LOCALAPPDATA%`
- Content-addressed where possible (SHA256 hashes)
- Verify checksums/signatures when available
- Deterministic: same spec + pinned versions → same artifacts

### Version Pinning & Lockfiles (MANDATORY)
- Specs MAY specify "latest" but MUST resolve to pinned version at planning time
- Generate lockfile artifact (UUID-addressed, JSON) with resolved versions
- Lockfile + spec → reproducible plan
- Lockfiles versioned and committed alongside specs
