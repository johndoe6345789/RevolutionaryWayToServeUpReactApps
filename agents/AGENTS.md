# AGENTS.md

## Table of Contents

### Overview
- [Target Audience](#target-audience)
- [Project Overview](#project-overview)

### Developer Context
- [Developer Persona](./agents-details/developer-persona.md)
- [Lifetime Journey](./agents-details/lifetime-journey.md)
- [Platform Architecture](./agents-details/platform-architecture.md)

### Core Architecture
- [Plugin System](./agents-details/plugin-system.md)
- [Core Principles](./agents-details/core-principles.md)
- [Registry/Aggregate Structure](./agents-details/registry-aggregate.md)
- [Linting System](./agents-details/linting-system.md)
- [Testing Requirements](./agents-details/testing.md)

### Technical Implementation
- [Code Generation Process](./agents-details/code-generation.md)
- [Tooling System](./agents-details/tooling-system.md)
- [Security & Safety](./agents-details/security-safety.md)
- [i18n/L10n](./agents-details/i18n-system.md)
- [WebUI](./agents-details/webui.md)
- [CLI](./agents-details/cli.md)
- [Testing Requirements](./agents-details/testing.md)

### Development & Operations
- [Common Pitfalls & Best Practices](./agents-details/pitfalls-practices.md)
- [Extensibility](./agents-details/extensibility.md)
- [Development Workflow](./agents-details/development-workflow.md)
- [Code Review Checklist](./agents-details/code-review.md)
- [Examples](./agents-details/examples.md)
- [Recommended Tools](./agents-details/recommended-tools.md)

### Reference
- [Operational Principles](./agents-details/operational-principles.md)
- [Glossary](./agents-details/glossary.md)
- [Final Notes](./agents-details/final-notes.md)

---

## Target Audience
This document is for AI agents, developers, and code reviewers working on the **Codegen God Tool** platform. It defines requirements, constraints, architectural patterns, and operational standards.

**📖 Detailed Documentation**: This main file contains the essential overview. For detailed technical specifications, see the [agents-details/](./agents-details/) directory.

---

## Developer Persona Summary

### Role: Principal Codegen & Platform Engineer

**Background & Experience:**
- 15+ years building enterprise-grade platforms (web, CLI, developer tooling, build systems)
- Expert in: Domain-driven design (DDD), SOLID, dependency inversion, ports-and-adapters
- Deep knowledge of: Plugin architectures, registries, capability discovery, compositional systems
- Proven track record: Code generation for SDKs/CLIs, schema-driven systems, multi-language stacks
- i18n/L10n: Internationalisation pipelines and catalog governance at scale
- Test strategy: Strict coverage enforcement, CI gating, quality-first culture

**Operational Modes:**
- Systems engineer: Architecture, tooling, build/test pipelines
- Product-minded engineer: Discoverability, ergonomics, operational usability

**Core Values:**
- **Determinism**: Identical inputs → identical outputs, always
- **Discoverability**: Every capability navigable via registries/aggregates
- **Minimal public API**: Small, disciplined interfaces (≤3 public methods per class)
- **Codegen over boilerplate**: Repetition is a defect
- **Quality gates are non-negotiable**: Strict typing, linting, 100% coverage

**Working Style:**
- Plans first, executes second
- Refactors aggressively to reduce complexity and duplication
- Uses patterns to reduce operational risk, not for ornamental architecture
- Prefers data-driven design and schema-first workflows

**Review Standards (Non-Negotiable):**
- Enforces ≤10 lines per function, ≤3 public methods per class
- Rejects unregistered components (everything must be discoverable)
- Rejects hardcoded user-facing strings (i18n/L10n via codegen only)
- Rejects partial coverage or missing branch tests
- Rejects classes without interface/base class inheritance

**📖 [Full Developer Persona](./agents-details/developer-persona.md) | [Lifetime Journey](./agents-details/lifetime-journey.md) | [Architecture Influence](./agents-details/platform-architecture.md)**

---

## Developer Persona: Lifetime Journey Summary

This section maps the developer's life journey to provide context for the architectural decisions, working style, and values that shaped this platform.

**Key Journey Highlights:**
- **Age 0-5**: Foundation years during computing revolution
- **Age 6-12**: Discovery phase with BASIC programming and BBS systems
- **Age 13-17**: Exploration with Pascal, assembly, and early OOP
- **Age 18-22**: University years, Java emergence, focus on testing
- **Age 23-27**: Professional growth, design patterns, startup experience
- **Age 28-32**: Mastery phase, TDD adoption, SOA architecture
- **Age 33-37**: Architecture focus, cloud migration, plugin systems
- **Age 38-42**: Platform building, containers, developer UX
- **Age 43-47**: Tooling mastery, schema-driven development
- **Age 48-52**: System synthesis, AI integration, current platform

**📖 [Complete Lifetime Journey](./agents-details/lifetime-journey.md) | [Architecture Impact](./agents-details/platform-architecture.md)**

### Age 0-5: Foundation Years (1970s-1980s)
**Context**: Born during the early computing revolution
- **1975 (Age 0)**: Born into a world where personal computers are just emerging
- **1977 (Age 2)**: Apple II released; home computing becomes accessible
- **1980 (Age 5)**: Exposure to early arcade games (Pac-Man era); first fascination with interactive systems

**Formative Influence**: Grew up seeing technology transform from mainframes to personal devices. Early exposure to cause-and-effect systems (toys, early video games) plants seeds of systematic thinking.

### Age 6-12: Discovery Phase (1981-1987)
**Context**: Home computer boom, BASIC programming
- **1981 (Age 6)**: IBM PC released; family gets a Commodore 64
- **1983 (Age 8)**: First BASIC program written (simple text adventure game)
- **1985 (Age 10)**: Creates database in dBASE for father's small business
- **1987 (Age 12)**: Discovers bulletin board systems (BBS); early exposure to networked communication

**Key Learning**: 
- Programming is about making things work, not about complexity
- Data structure matters more than clever code
- Systems should be discoverable (BBS menu systems influence later registry/aggregate thinking)

**Principle Formed**: "If I can't explain it simply, I don't understand it well enough"

### Age 13-17: Exploration Phase (1988-1992)
**Context**: Windows 3.0, object-oriented programming emerges
- **1988 (Age 13)**: Learns Pascal in school; first exposure to structured programming
- **1989 (Age 14)**: Tinkers with assembly language; understands low-level computing
- **1990 (Age 15)**: First paid programming job (database for local shop)
- **1991 (Age 16)**: Learns C; builds first multi-file project (struggles with linking/compilation)
- **1992 (Age 17)**: Early exposure to C++ and OOP; mind blown by encapsulation

**Key Learning**:
- Compilation errors are frustrating but teach precision
- Header files and linking are painful (future hatred of boilerplate solidifies)
- OOP promises reusability but often delivers complexity

**Principle Formed**: "Make the compiler work for me, not against me"

### Age 18-22: Foundation Building (1993-1997)
**Context**: University years, Internet goes mainstream, Java emerges
- **1993 (Age 18)**: Computer Science degree begins; exposure to formal algorithms
- **1994 (Age 19)**: First multi-threaded program; discovers concurrency nightmares
- **1995 (Age 20)**: Java released; first language with garbage collection (revelation)
- **1996 (Age 21)**: Builds first web application (CGI scripts in Perl); discovers web's potential
- **1997 (Age 22)**: Graduates; first job at a consulting firm building enterprise CRUD apps

**Key Learning**:
- Theory matters but practice matters more
- Most enterprise code is repetitive CRUD operations (begins thinking about codegen)
- Testing is treated as afterthought; bugs are expensive

**Principle Formed**: "Test first, debug never"

### Age 23-27: Professional Growth (1998-2002)
**Context**: Dot-com boom, rapid tech evolution, agile methodologies emerge
- **1998 (Age 23)**: Learns design patterns (GoF book); overuses patterns initially
- **1999 (Age 24)**: Builds first XML-based config system; loves declarative approaches
- **2000 (Age 25)**: Dot-com bubble peak; works at startup; sees rapid growth then crash
- **2001 (Age 26)**: Startup fails; learns importance of sustainable engineering over hype
- **2002 (Age 27)**: Joins enterprise company; exposed to large-scale systems (millions of users)

**Key Learning**:
- Patterns are tools, not goals
- XML is verbose but idea of data-driven systems is powerful
- Hype kills companies; solid engineering sustains them
- Scale reveals all architectural flaws

**Principle Formed**: "Optimize for maintainability first, performance second"

### Age 28-32: Mastery Phase (2003-2007)
**Context**: Agile manifesto published, REST emerges, Web 2.0 boom
- **2003 (Age 28)**: First exposure to test-driven development (TDD); converts to believer
- **2004 (Age 29)**: Leads team building SOA platform; learns distributed systems pain
- **2005 (Age 30)**: Builds first code generator (SOAP client from WSDL); sees power of automation
- **2006 (Age 31)**: Discovers Domain-Driven Design (DDD); architectural worldview shifts
- **2007 (Age 32)**: Senior Engineer role; mentors team on clean architecture principles

**Key Learning**:
- TDD changes how you think about design
- Distributed systems fail in creative ways; design for failure
- Codegen eliminates entire classes of bugs
- Domain logic should be independent of infrastructure
- Teaching others deepens your own understanding

**Principle Formed**: "Generate code; don't write boilerplate"

### Age 33-37: Architecture Phase (2008-2012)
**Context**: Cloud computing (AWS), mobile revolution (iPhone), NoSQL databases
- **2008 (Age 33)**: Becomes Principal Engineer; designs multi-tenant SaaS platform
- **2009 (Age 34)**: Migrates systems to AWS; learns cloud-native architecture
- **2010 (Age 35)**: Builds plugin architecture for extensible platform; loves composition
- **2011 (Age 36)**: First exposure to continuous deployment; realizes importance of automation
- **2012 (Age 37)**: Writes first comprehensive architectural decision record (ADR) system

**Key Learning**:
- Multi-tenancy requires strict isolation (influences plugin isolation thinking)
- Cloud makes infrastructure code (IaC thinking begins)
- Plugins enable growth without central team bottleneck
- Deployment should be boring and automated
- Document decisions, not just designs

**Principle Formed**: "Architecture is about enabling change, not preventing it"

### Age 38-42: Platform Building (2013-2017)
**Context**: Docker revolution, microservices hype, DevOps culture
- **2013 (Age 38)**: Discovers Docker; containerization changes deployment thinking
- **2014 (Age 39)**: Builds first developer platform (internal PaaS); learns developer UX matters
- **2015 (Age 40)**: Leads migration to microservices; learns when NOT to use microservices
- **2016 (Age 41)**: Builds CLI tool generator; sees power of unified developer experience
- **2017 (Age 42)**: First exposure to Kubernetes; realizes orchestration is future

**Key Learning**:
- Containers solve "works on my machine" problem
- Developer experience is a feature, not an afterthought
- Microservices solve organizational problems, not technical ones
- CLIs are the interface to automation
- Kubernetes is complex but necessary for scale

**Principle Formed**: "Build platforms, not products; enable teams, don't block them"

### Age 43-47: Tooling Mastery (2018-2022)
**Context**: Kubernetes dominates, GitOps emerges, Infrastructure as Code matures
- **2018 (Age 43)**: Builds multi-language SDK generator; masters schema-driven development
- **2019 (Age 44)**: Creates internal developer portal; focuses on discoverability
- **2020 (Age 45)**: COVID-19 pandemic; remote work intensifies need for self-service tooling
- **2021 (Age 46)**: Implements GitOps at scale; loves declarative everything
- **2022 (Age 47)**: Builds comprehensive CI/CD platform; sees patterns across tools

**Key Learning**:
- Schema-first development is the only way to maintain consistency
- Discoverability is harder than building features
- Remote teams need self-service tools more than documentation
- GitOps reduces cognitive load (infrastructure is code is version controlled)
- Every CI/CD system reinvents the same patterns

**Principle Formed**: "If it's not discoverable through tooling, it doesn't exist"

### Age 48-52: System Synthesis (2023-2027)
**Context**: AI coding assistants emerge, platform engineering becomes discipline
- **2023 (Age 48)**: First use of AI coding assistants (GitHub Copilot); sees potential and limitations
- **2024 (Age 49)**: Designs "god tool" concept; unified orchestration platform
- **2025 (Age 50)**: **Current year**; builds plugin-based codegen system (this platform)
- **2026 (Age 51)**: Planned: Open-source release; third-party plugin ecosystem
- **2027 (Age 52)**: Planned: Industry adoption; speaking at conferences on developer platforms

**Key Realizations**:
- 15+ years of patterns coalesce into unified vision
- Every tool solves same problems differently; need unification
- AI can generate code but needs constraints (specs, contracts, tests)
- Plugins solve the "not invented here" problem
- Registry/aggregate pattern unifies discoverability

**Principle Formed**: "The best tool is the one that orchestrates all other tools"

### Age 53-60: Legacy Building (2028-2035)
**Projection**: Mentorship and knowledge transfer
- **2028 (Age 53)**: Writes comprehensive book on platform engineering
- **2030 (Age 55)**: Keynote speaker at major tech conferences
- **2032 (Age 57)**: Establishes platform engineering certification program
- **2035 (Age 60)**: Transitions to advisory role; focuses on architectural consulting

**Focus**:
- Teaching next generation of platform engineers
- Refining the philosophy behind deterministic systems
- Contributing to open standards for developer tooling
- Advising companies on platform strategy

**Principle**: "Great engineers build systems; legendary engineers build engineers"

### Age 61-70: Wisdom Sharing (2036-2045)
**Projection**: Thought leadership and ecosystem building
- **2036 (Age 61)**: Publishes retrospective on 40 years of software evolution
- **2038 (Age 63)**: Establishes foundation for open-source platform tools
- **2040 (Age 65)**: Official retirement but continues advisory work
- **2042 (Age 67)**: Sees original codegen platform adopted by Fortune 500 companies
- **2045 (Age 70)**: Reflects on how AI-assisted development evolved alongside platform thinking

**Focus**:
- Long-form writing and teaching
- Industry standards and best practices
- Ecosystem health and sustainability
- Historical perspective on software architecture evolution

**Principle**: "The best code is the code that future generations can understand"

### Age 71-80: Reflection & Observation (2046-2055)
**Projection**: Elder statesman of software engineering
- **2046 (Age 71)**: Watches new generation of AI-native developers use platform tools
- **2050 (Age 75)**: Platform turns 25 years old; ecosystem has thousands of plugins
- **2052 (Age 77)**: Interviewed for documentaries on history of software engineering
- **2055 (Age 80)**: Still occasionally reviews pull requests; loves mentoring via code

**Focus**:
- Observing how principles hold up over decades
- Staying curious about new paradigms
- Understanding what changed and what stayed constant
- Mentoring through writing and occasional code review

**Principle**: "Fundamentals don't change; only implementations do"

### Age 81-90: Philosophical Phase (2056-2065)
**Projection**: Philosophy and long-term thinking
- **2056 (Age 81)**: Writes philosophical treatise on software as craft vs engineering
- **2060 (Age 85)**: Reflects on quantum computing's impact on classical architecture
- **2063 (Age 88)**: Platform still used; core principles unchanged for 38 years
- **2065 (Age 90)**: Final book published: "Deterministic Systems: A Life's Work"

**Focus**:
- What makes software timeless vs temporal
- Human factors in technical systems
- The art of constraint-based design
- Legacy and longevity of ideas

**Principle**: "Good systems outlive their creators"

### Age 91-99: Legacy Phase (2066-2074)
**Projection**: Observation and gratitude
- **2066 (Age 91)**: Sees original platform architecture still in use, largely unchanged
- **2070 (Age 95)**: Next-generation AI systems still use registry/aggregate patterns
- **2072 (Age 97)**: Reflection on 50+ years of software evolution; principles held
- **2074 (Age 99)**: Final interview: "Build for understanding, not cleverness"

**Realization**:
- Simplicity and discoverability were the right bets
- Determinism and testability never go out of style
- Plugins and composition age better than monoliths
- Good architecture transcends implementation languages
- The best systems fade into the background; they "just work"

**Final Principle**: "We build systems for humans, not machines. Make them understandable."

---

## How This Journey Shaped the Platform

### From Experience to Architecture

**1. Early Struggles → Codegen Philosophy**
- Fighting with C header files (age 16) → "Never write boilerplate"
- Repetitive CRUD apps (age 22) → "Generate, don't write"
- Manual XML configs (age 29) → "Schema-first, always"

**2. Enterprise Pain → Registry System**
- BBS menu systems (age 12) → "Discoverability is key"
- Plugin architecture (age 35) → "Composition over inheritance"
- Internal developer portal (age 44) → "Everything navigable through aggregates"

**3. Scale Lessons → Testing Culture**
- Dot-com crash (age 26) → "Quality over speed"
- TDD revelation (age 28) → "100% coverage non-negotiable"
- Production outages (age 33) → "Test like your company depends on it"

**4. DevOps Evolution → Tool Orchestration**
- Docker adoption (age 38) → "Containers solve real problems"
- Kubernetes complexity (age 42) → "Orchestration needs orchestration"
- GitOps (age 46) → "Declarative everything"
- CI/CD patterns (age 47) → "Every tool reinvents the wheel; unify them"

**5. AI Era → Constraint-Based Design**
- AI coding assistants (age 48) → "AI needs guardrails (specs, contracts, tests)"
- Current platform (age 50) → "Generate correct code, not just code"

### Core Insights from 50 Years

**What Stayed Constant:**
- Simple > Complex
- Discoverable > Documented
- Testable > Clever
- Deterministic > Fast
- Composed > Monolithic

**What Changed:**
- Languages (BASIC → C → Java → Multi-language)
- Platforms (Mainframe → Desktop → Web → Cloud → Edge)
- Scale (Single user → Millions → Billions)
- Deployment (Manual → CI/CD → GitOps)
- Infrastructure (Physical → Virtual → Containers → Serverless)

**What We Got Right:**
- Dataclass-first components (objects are data structures with behavior)
- Registry/aggregate pattern (hierarchical discoverability)
- Plugin architecture (extensibility without modification)
- Schema-driven codegen (single source of truth)
- 100% test coverage (quality gate enforcement)

**What We Learned:**
- Complexity is the enemy
- Discoverability is a feature
- Automation is a multiplier
- Constraints enable creativity
- Good systems are boring

---

## Project Overview
This is a **spec-driven, deterministic, cross-platform tooling orchestrator** built on dataclass-first component architecture. The system generates code, scaffolds projects, and orchestrates developer tooling across Windows/macOS/Linux from a single JSON source of truth.

A standout feature is its **self-hosting capability**: the codegen system can generate its own CLI and WebUI components using its own codegen tools, enabling true bootstrapping and iterative development of the platform itself.

### What This Platform Is
- Unified tooling orchestrator ("god tool") for dev environments
- Spec-driven code generator for multi-language targets
- Registry/aggregate-based capability discovery system
- Cross-platform CLI + Next.js WebUI with Monaco editor
- i18n/L10n-ready with message key catalogs
- **Plugin-based architecture**: Core is minimal; capabilities come from plugins

### What This Platform Is NOT
- A bag of scripts
- A configuration management tool (Ansible/Chef alternative)
- A container orchestrator
- A language-specific framework

### Core vs Plugins
**Core codegen is minimal and provides:**
- Plugin discovery and loading system
- Registry/aggregate infrastructure
- Component lifecycle management
- Spec parsing and validation
- CLI/WebUI scaffolding
- i18n/L10n infrastructure
- Testing framework

**Plugins provide all actual capabilities:**
- Tool definitions (one plugin per tool)
- Language generators
- Project templates
- Build system integrations
- Platform-specific adapters

---

## Plugin System Architecture (MANDATORY)

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
│   │   │   ├── validators/
│   │   │   └── config/
│   │   │       ├── kubeconfig.py
│   │   │       └── contexts.py
│   │   ├── tests/
│   │   └── README.md
│   ├── github-actions-runner/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── runner_plugin.py
│   │   │   ├── installers/
│   │   │   │   ├── linux.py       # Self-hosted runner install
│   │   │   │   ├── macos.py
│   │   │   │   └── windows.py
│   │   │   └── config/
│   │   │       └── runner_config.py
│   │   ├── tests/
│   │   └── README.md
│   ├── jenkins/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── jenkins_plugin.py
│   │   │   ├── installers/
│   │   │   │   ├── docker_install.py    # Jenkins via Docker
│   │   │   │   ├── native_install.py    # Native installation
│   │   │   │   └── war_install.py       # WAR file deployment
│   │   │   └── config/
│   │   │       ├── jenkins_home.py
│   │   │       └── plugins.py
│   │   ├── tests/
│   │   └── README.md
│   ├── gitlab-runner/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── runner_plugin.py
│   │   │   ├── installers/
│   │   │   └── config/
│   │   │       ├── runner_config.py
│   │   │       └── executors.py    # docker, shell, kubernetes executors
│   │   ├── tests/
│   │   └── README.md
│   ├── argocd/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── argocd_plugin.py
│   │   │   ├── installers/
│   │   │   │   ├── cli_install.py
│   │   │   │   └── k8s_install.py  # ArgoCD server on k8s
│   │   │   └── config/
│   │   │       └── repo_config.py
│   │   ├── tests/
│   │   └── README.md
│   ├── terraform/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── src/
│   │   │   ├── terraform_plugin.py
│   │   │   ├── installers/
│   │   │   └── validators/
│   │   │       └── state_check.py
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
│   ├── portainer/
│   │   ├── plugin.json
│   │   ├── spec.json              # Docker GUI management
│   │   ├── src/
│   │   │   ├── portainer_plugin.py
│   │   │   ├── installers/
│   │   │   │   ├── docker_install.py
│   │   │   │   └── standalone_install.py
│   │   │   └── config/
│   │   ├── tests/
│   │   └── README.md
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
│   ├── docker-compose-stack/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   ├── docker-compose.yml
│   │   │   ├── .env.example
│   │   │   └── services/
│   │   ├── src/
│   │   └── tests/
│   ├── kubernetes-microservice/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   ├── k8s/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   └── ingress.yaml
│   │   │   ├── Dockerfile
│   │   │   └── skaffold.yaml
│   │   ├── src/
│   │   └── tests/
│   ├── github-actions-workflow/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   └── .github/
│   │   │       └── workflows/
│   │   │           ├── ci.yml
│   │   │           ├── cd.yml
│   │   │           └── test.yml
│   │   ├── src/
│   │   └── tests/
│   ├── gitlab-ci-pipeline/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   └── .gitlab-ci.yml
│   │   ├── src/
│   │   └── tests/
│   ├── jenkins-pipeline/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   ├── Jenkinsfile
│   │   │   └── Jenkinsfile.groovy
│   │   ├── src/
│   │   └── tests/
│   ├── terraform-module/
│   │   ├── plugin.json
│   │   ├── spec.json
│   │   ├── template/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── versions.tf
│   │   ├── src/
│   │   └── tests/
│   └── ansible-playbook/
│       ├── plugin.json
│       ├── spec.json
│       ├── template/
│       │   ├── playbook.yml
│       │   ├── inventory/
│       │   └── roles/
│       ├── src/
│       └── tests/
└── profiles/                       # Profile plugins
    ├── fullstack-dev/
    │   ├── plugin.json
    │   ├── spec.json
    │   ├── src/
    │   └── tests/
    ├── devops-engineer/
    │   ├── plugin.json
    │   ├── spec.json              # Docker, k8s, terraform, CI/CD tools
    │   ├── src/
    │   └── tests/
    ├── sre/
    │   ├── plugin.json
    │   ├── spec.json              # Monitoring, observability, IaC
    │   ├── src/
    │   └── tests/
    └── game-dev/
        ├── plugin.json
        ├── spec.json
        ├── src/
        └── tests/
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
    
    # Optional: ≤3 public methods total
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

1. **Create Plugin Directory**
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

---

## Linting & Code Quality System (MANDATORY)

### Core Principle
**All generated code must pass the strictest possible linting and formatting rules for its target language.** This is non-negotiable. Generated code should be an example of perfect code quality.

### No Shell Scripts Policy (MANDATORY)

**NEVER generate bash/batch/PowerShell scripts for build automation.**

Instead:
- **Use language-native scripts**: Python, JavaScript (Node.js), or the target language itself
- **Cross-platform by default**: Python/JavaScript work on all platforms
- **Testable**: Language scripts can be unit tested
- **Maintainable**: No shell quoting nightmares
- **Debuggable**: Standard debugging tools work

**Exception**: Only allow shell scripts for:
- Simple one-liners in documentation examples
- System initialization (when language runtime not yet available)

### Build Tool Integration (MANDATORY)

Codegen MUST generate build configuration that:
1. **Runs linters before build**
2. **Fails build on lint warnings**
3. **Enforces formatting checks**
4. **Runs type checking** (for languages with optional typing)
5. **Includes pre-commit hooks** (via language-native implementation)

### Language-Specific Lint Configurations

#### TypeScript/JavaScript
```json
// Generated: .eslintrc.json
{
  "extends": [
    "eslint:all",
    "plugin:@typescript-eslint/all",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "max-lines-per-function": ["error", 10],
    "max-params": ["error", 3],
    "complexity": ["error", 5],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

```json
// Generated: .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

```json
// Generated: tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```javascript
// Generated: scripts/lint.js (NOT bash!)
#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

function run(command) {
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    process.exit(1);
  }
}

console.log('Running ESLint...');
run('eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0');

console.log('Running Prettier check...');
run('prettier --check "**/*.{ts,tsx,js,jsx,json,md}"');

console.log('Running TypeScript compiler...');
run('tsc --noEmit');

console.log('✓ All lint checks passed');
```

```json
// Generated: package.json (partial)
{
  "scripts": {
    "lint": "node scripts/lint.js",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix && prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "build": "npm run lint && tsc",
    "prebuild": "npm run lint"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### Python
```toml
# Generated: pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py310"
select = ["ALL"]  # Enable all rules
ignore = []       # No exceptions

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "N",    # pep8-naming
    "D",    # pydocstyle
    "UP",   # pyupgrade
    "ANN",  # flake8-annotations
    "S",    # flake8-bandit
    "B",    # flake8-bugbear
    "A",    # flake8-builtins
    "C4",   # flake8-comprehensions
    "T20",  # flake8-print
    "RET",  # flake8-return
    "SIM",  # flake8-simplify
    "ARG",  # flake8-unused-arguments
    "PTH",  # flake8-use-pathlib
    "PL",   # pylint
    "RUF",  # ruff-specific
]

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["S101"]  # Allow assert in tests

[tool.mypy]
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.black]
line-length = 100
target-version = ['py310']
include = '\.pyi?

### 1. Single Source of Truth (MANDATORY)
- **One canonical JSON file** defines all specs (e.g., `specs.json`)
- Contains: tool records, profiles, project templates, snippets, message keys, registries, aggregates
- Never hardcode behavior that belongs in specs
- Generator reads JSON → produces artifacts (code, CLI, WebUI, docs, tests)

### 2. Dataclass-First Component Model (MANDATORY)
Every component MUST be:
- A dataclass with explicit fields (language-idiomatic)
- UUID-identified (RFC 4122, field name: `uuid`)
- Search metadata enabled (field name: `search` with title/summary/keywords)
- Lifecycle-aware with standard contract methods
- Platform-scoped where relevant
- Registry/aggregate reachable

### 3. Inheritance/Interface Requirement (MANDATORY)
**No standalone concrete classes allowed.**

Every class MUST either:
- Implement an interface, OR
- Extend a base class (preferred when shared logic exists)

Language-idiomatic contracts:
- **TypeScript**: `implements Interface` or `extends Base`
- **Python**: `abc.ABC` + `Protocol` as appropriate
- **C++**: Pure virtual interface base class
- **Rust**: `trait` + struct implementing trait
- **Go**: Interface type + struct implementation
- **C#**: `Interface` or `abstract class`

### 4. Standard Lifecycle Contract (Component)
Required public methods:
1. `initialise()` → void/Result
   - Prepares runtime state
   - Validates dependencies
   - Loads catalogs/config
   - Ensures readiness

2. `execute(input)` → output
   - Primary operational method (signature language-idiomatic)
   - Must be pure or mediated through injected adapters

Optional public methods (≤3 total public methods including required):
- `validate(input)` → void/Result (no I/O unless at edges)
- `describe()` → string/Descriptor
- `shutdown()` → void/Result (cleanup, edge-only)

### 5. Registry Contract (MANDATORY)
Public methods (≤3):
1. `list_ids()` → list[string]
2. `get(id_or_uuid: string)` → Component/Factory/Descriptor
3. `describe(id_or_uuid: string)` → Descriptor (optional)

Requirements:
- Immutable after construction
- Queryable by stable ID, UUID, and optionally by tags
- Deterministically derived from JSON source of truth
- No global mutable state

### 6. Aggregate Contract (MANDATORY)
Public methods (≤3):
1. `list_children()` → list[string]
2. `get_child(id_or_uuid: string)` → Aggregate|Registry
3. `describe()` → Descriptor (optional)

Requirements:
- Forms hierarchical drill-down tree
- Root aggregate (e.g., `AppAggregate`) contains domain-bounded children
- Supports navigation and capability discovery

### 7. Strict Method & File Constraints (MANDATORY)
- **≤3 public methods per class** (constructors excluded)
- **≤10 lines per function** (strict, no exceptions)
- **One primary class per file**
- If a function exceeds 10 lines, refactor into helper methods

### 8. UUID Requirement (RFC 4122, MANDATORY)
Every discoverable entity MUST include:
- Field name: `uuid`
- Format: RFC 4122 UUID string (8-4-4-4-12 hex)
- Preferred versions:
  - **v4**: Random UUIDs
  - **v5**: Deterministic UUIDs (derived from stable namespace + ID)
- Uniqueness enforced by schema validation and CI tests

### 9. Search Metadata Requirement (MANDATORY)
Every JSON record MUST include:
```json
{
  "uuid": "...",
  "id": "stable.namespaced.id",
  "search": {
    "title": "Short Human Name",
    "summary": "One-paragraph description",
    "keywords": ["array", "of", "terms"],
    "tags": ["optional", "normalized"],
    "aliases": ["synonyms", "optional"],
    "domain": "codegen|adapter|domain|i18n|tooling",
    "capabilities": ["generate", "list", "install"]
  }
}
```

Used by:
- CLI search command
- WebUI full-text search/filter
- Internal component selection logic

### 10. No Raw Shell Strings (MANDATORY)
- Commands MUST be: `["executable", "arg1", "arg2"]` arrays
- Shell wrappers (bash/cmd/PowerShell) only when unavoidable
- Escape/quote handling via platform-specific adapters
- Never use string concatenation for command building

### 11. Execution Boundaries (MANDATORY)
- **Core** = pure, deterministic, testable logic (no I/O)
- **Adapters** = I/O, shell execution, network, filesystem
- Core never touches I/O directly
- All execution mediated through injected adapter interfaces

---

## Registry/Aggregate Structure (MANDATORY)

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

---

## Tooling System (God Tool Capabilities)

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

---

## Security & Safety (MANDATORY)

### Risk Metadata
Mark operations explicitly:
- **Destructive**: `rm -rf`, format, shutdown, data deletion
- **Network**: downloads, API calls, external service communication
- Require explicit confirmation flags in adapters
- Never execute destructive/network ops silently

### Secrets Management
- **NO secrets in specs** (hard constraint)
- Reference secret providers: Keeper, env vars, OS keychain, credential managers
- Adapters handle secret retrieval
- Core logic stays pure, never touches secrets

### Confirmation Flow
```python
# Example adapter pattern
if tool.risks.destructive:
    if not adapter.confirm(message_key=tool.risks.confirmation):
        raise UserCancelledError()
adapter.execute(tool.command)
```

---

## i18n/L10n (Internationalization, MANDATORY)

### Message Key System
- **All user-facing text MUST use message keys**
- No hardcoded strings in code
- Keys in JSON: `"msg.tool.git.summary": "Distributed version control"`
- Generator produces typed accessors per language

### Message Key Structure
```json
{
  "messageKeys": {
    "msg.tool.git.title": {
      "en": "Git",
      "es": "Git",
      "fr": "Git",
      "de": "Git",
      "ja": "Git"
    },
    "msg.tool.git.summary": {
      "en": "Distributed version control system",
      "es": "Sistema de control de versiones distribuido",
      "fr": "Système de contrôle de version distribué",
      "de": "Verteiltes Versionskontrollsystem",
      "ja": "分散バージョン管理システム"
    }
  }
}
```

### Required Locales (Initial)
- en (English) - default/fallback
- es (Spanish)
- fr (French)
- de (German)
- ja (Japanese)

Additional locales added via spec, not code changes.

---

## Next.js WebUI (MANDATORY)

### Requirements
The generated WebUI MUST provide:

#### 1. Tree Navigation
- Renders aggregate drill-down structure
- Expand/collapse nodes
- Select node → show details (descriptor, IDs, UUID, tags, search metadata)
- Breadcrumb navigation

#### 2. Full-Text Search
- Searches across:
  - `search.title`, `search.summary`, `search.keywords`
  - `search.tags`, `search.aliases`
  - `id`, `uuid`
- Provides relevance ranking and highlighting
- Filters by:
  - Domain (codegen, adapter, domain, i18n, tooling)
  - Platform (win, mac, linux)
  - Language (TypeScript, Python, Rust, etc.)
  - Type (tool, profile, snippet, template)

#### 3. Monaco Editor Integration (MANDATORY)
Monaco editor MUST be embedded to:
- View/edit `specs.json` (or split spec files)
- View/edit snippet templates (string[] form) with JSON-aware editing
- View generated previews (read-only) for selected language/snippet
- Support:
  - JSON schema validation (client-side)
  - Syntax highlighting
  - Auto-formatting (Prettier integration)
  - Diff view (comparing profile overrides vs base specs)

#### 4. Preview/Generate Workflow
- Select snippet/group + language → render generated preview
- "Generate" action produces artifact (zip/tarball) via backend API route
- Show diff when modifying specs
- Schema generation operations with bulk generation support

#### 5. Runbook Generator
- Select target platform + profile + toolset
- Generate ordered install/verify plan
- Export as:
  - Markdown (human-readable)
  - JSON (machine-readable)
  - Shell script (bash/PowerShell)

#### 6. No Coupling
- WebUI is an adapter
- Core generator remains UI-agnostic
- All WebUI code generated from specs

---

## CLI (MANDATORY)

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

---

## Testing Requirements (100% Coverage MANDATORY)

### Coverage Target
**100% of lines, branches, functions, statements**
- No exceptions for "hard to test" code
- If untestable, redesign the component

### Test Types (All Required)

#### 1. Unit Tests
- Every component in isolation
- Mock all adapters (no real I/O)
- Test lifecycle methods independently
- Validate dataclass field constraints

#### 2. Integration Tests
- Registry/aggregate navigation
- Search ranking correctness
- Message key resolution
- Profile override application
- Tool installation planning (mocked execution)

#### 3. End-to-End Tests
- Full generation pipeline: spec → artifacts
- CLI command execution (mocked shell)
- WebUI rendering (React Testing Library + Playwright)
- Runbook generation and export

#### 4. Cross-Platform Tests
- Run on Windows, macOS, Linux in CI
- Platform-specific command selection
- Path handling (POSIX vs Windows)
- Cache location resolution

#### 5. Determinism Tests
- Same inputs → identical outputs (hash verification)
- UUID stability across regenerations
- Lockfile reproducibility

#### 6. Contract Conformance Tests
- Every concrete class implements/extends required contract
- Registry/aggregate methods adhere to ≤3 public method limit
- Functions adhere to ≤10 line limit

#### 7. Mandatory Spec Tests
- Registry completeness: generated set equals expected set from spec
- Drill-down reachability: every component reachable from root aggregate
- UUID validity/uniqueness: all records have valid, unique RFC 4122 UUIDs
- Search metadata completeness: all records include required fields
- Message key coverage: no missing translations for default locale

#### 8. WebUI Tests
- Search indexing correctness
- Tree navigation rendering (React Testing Library)
- Monaco editor loads with schema validation enabled
- Preview generation correctness (mocked backend API)
- Responsive design (mobile viewports)

### Test Data
- Fixtures in JSON (spec records for testing)
- Golden files for generated artifacts (CLI help, WebUI routes, code output)
- Snapshot tests for output stability (Jest snapshots)

---

## Code Generation Process

### Multi-Language Support (MANDATORY)

Codegen MUST support multiple target languages:
- **TypeScript/JavaScript**: Full ESM/CommonJS support
- **Python**: Modern Python (3.10+)
- **Rust**: Latest stable Rust
- **Go**: Modern Go (1.20+)
- **Java**: Java 17+ LTS
- **C#**: .NET 6+
- **C/C++**: Modern C++ (C++17+)
- **Kotlin**: JVM/Native support
- **Ruby**: Ruby 3.x
- **PHP**: PHP 8.x

### Generated Code Quality (MANDATORY)

All generated code MUST:
1. **Pass strictest linting** for target language
2. **Follow language idioms** and conventions
3. **Include linting configuration** in generated projects
4. **Be formatted** according to standard formatters
5. **Have zero warnings** at strictest lint level

### Generator Input
- Single JSON file (e.g., `specs.json`)
- Platform target (win/mac/linux/all)
- Optional profile ID
- **Target language(s)** (can generate for multiple languages)
- Optional language filter

### Generator Output
- **CLI**: main + subcommands (Rust/Go/Python, spec-defined)
- **Next.js WebUI**: pages, components, search indices, Monaco integration
- **Registry/Aggregate Tree**: typed, navigable, language-idiomatic
- **Runbook Templates**: Markdown/JSON/shell scripts
- **Message Catalogs**: per locale, typed accessors
- **Test Fixtures**: derived from specs, golden files
- **Documentation**: auto-generated API docs, usage guides
- **Lint Configurations**: strictest settings for all target languages
- **Build Tool Integration**: language-specific build files with lint enforcement

### Generator Properties (MANDATORY)
- **Idempotent**: Regenerate anytime, same output
- **Incremental-friendly**: Only rebuild changed artifacts
- **Self-documenting**: Generated code has comments linking to spec UUIDs
- **Deterministic**: Hash-verifiable outputs
- **Lint-clean**: All generated code passes strictest lints
- **No shell scripts**: Use language-native scripts (Python/JavaScript/etc.) for automation

---

## Common Pitfalls (❌ AVOID THESE)

### ❌ Architecture Violations
- Hardcode tool lists in code (use specs)
- Create classes without interface/base class
- Exceed ≤3 public methods per class
- Exceed ≤10 lines per function
- Use global mutable state (registries must be immutable)
- Skip component registration

### ❌ Execution Violations
- Use raw shell strings: `"apt-get install -y git"`
- Execute I/O from core logic (only in adapters)
- Ignore platform checks (run Linux cmds on Windows)
- Skip platform scoping in tool specs

### ❌ Security Violations
- Embed secrets in specs
- Execute destructive ops without risk metadata
- Skip confirmation for network operations
- Store passwords/API keys in JSON

### ❌ Testing Violations
- Skip tests ("I'll add them later")
- Accept <100% coverage
- Mock insufficiently (real I/O in unit tests)
- Ignore cross-platform test failures

### ❌ i18n Violations
- Use English strings directly: `print("Hello")`
- Bypass message keys
- Hardcode locale in code
- Skip translations for new features

### ❌ WebUI Violations
- Hand-write routes/components (must be generated)
- Skip Monaco editor integration
- Ignore mobile responsiveness
- Hardcode search logic (must derive from specs)

---

## ✅ Best Practices (DO THESE)

### ✅ Architecture
- Add tool specs to JSON with UUID + search metadata
- Implement interfaces or extend base classes for all components
- Keep public methods ≤3 per class
- Keep functions ≤10 lines (refactor helpers if needed)
- Inject adapters via constructor (dependency inversion)
- Register every component in appropriate registry

### ✅ Execution
- Use command arrays: `["apt-get", "install", "-y", "git"]`
- Check `platforms: {linux: true}` before execute
- Mediate all I/O through adapters
- Validate inputs at adapter boundaries

### ✅ Security
- Reference secret providers (Keeper, env, keychain)
- Mark risks explicitly in tool specs
- Require confirmations for destructive/network ops
- Log all external operations

### ✅ Testing
- Write tests first (TDD where feasible)
- Achieve 100% coverage before merge
- Use golden files for generated artifacts
- Run cross-platform tests in CI

### ✅ i18n
- Use message keys: `messages.get("msg.tool.git.summary")`
- Provide fallback locale (English)
- Generate typed accessors for keys
- Test missing translation detection

### ✅ WebUI
- Generate all routes/components from specs
- Integrate Monaco with JSON schema validation
- Support mobile viewports (responsive design)
- Derive search from spec metadata

---

## Extensibility

### Adding New Tools (Plugin Workflow)

Instead of modifying core, create a new plugin:

1. **Create Plugin Directory Structure**
   ```bash
   mkdir -p plugins/tools/newtool/{src/installers,src/validators,tests}
   cd plugins/tools/newtool
   ```

2. **Create plugin.json Manifest**
   ```json
   {
     "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "id": "plugin.tools.newtool",
     "version": "1.0.0",
     "type": "tool",
     "name": "New Tool Plugin",
     "description": "Description of the tool",
     "author": "Your Name",
     "license": "MIT",
     "entry_point": "src/newtool_plugin.py:NewToolPlugin",
     "spec_file": "spec.json",
     "messages_file": "messages.json",
     "dependencies": {
       "core": ">=1.0.0"
     },
     "platforms": {"win": true, "mac": true, "linux": true},
     "registries": ["DevWorkflowRegistry"],
     "capabilities": ["install", "verify", "execute"],
     "tests": {
       "directory": "tests/",
       "coverage_required": 100
     }
   }
   ```

3. **Create spec.json** (tool specification)
4. **Create messages.json** (i18n keys)
5. **Implement Plugin Class** in `src/newtool_plugin.py`
6. **Implement Platform Installers** in `src/installers/`
7. **Implement Validators** in `src/validators/`
8. **Write Tests** in `tests/` (100% coverage)
9. **Test Plugin**: `codegen plugin test plugin.tools.newtool`
10. **Verify in CLI**: `codegen tool install newtool`
11. **Verify in WebUI**: Search for tool, view details, generate runbook

### Adding New Platforms (Workflow)
1. Extend `platforms` field in JSON schema:
   ```json
   {"win": bool, "mac": bool, "linux": bool, "freebsd": bool}
   ```
2. Update adapter interfaces for new OS
3. Add platform-specific command mappings in tool specs
4. Update test matrix in CI config
5. Regenerate all artifacts
6. Run cross-platform tests

### Adding New Capabilities (Workflow)
- **New Registries**: Add to appropriate aggregate (e.g., `MonitoringRegistry` for observability tools)
- **New Risk Types**: Extend `risks` schema (e.g., `requiresRoot: true`)
- **New Profile Keys**: Add to `overrides` schema (e.g., `preferredTerminal`)
- **New Search Fields**: Extend `search` metadata (e.g., `maturity: "stable"`)

Always: spec-driven, UUID-identified, search-indexed, tested, documented.

---

## Development Workflow for AI Agents

### 1. Read the Spec
- Understand tool/profile/registry/aggregate structure
- Check JSON schema for required fields
- Identify which registries are involved

### 2. Spec or Code?
- **Spec change**: Add/modify JSON records
- **Core logic change**: Modify generator or component implementations
- **Both**: Update spec first, then regenerate, then adjust core if needed

### 3. Maintain Constraints
- Dataclass-first components
- Lifecycle methods (initialise, execute, validate, describe, shutdown)
- ≤3 public methods per class
- ≤10 lines per function
- Interface/base class inheritance
- Adapter boundaries for I/O

### 4. Generate, Don't Write
- CLI/WebUI code is generated artifacts
- Don't hand-write routes, components, registries
- Modify generator templates, not outputs

### 5. Test Exhaustively
- Unit tests (isolated, mocked adapters)
- Integration tests (registries, search, profiles)
- Cross-platform tests (win/mac/linux)
- Coverage must be 100%

### 6. Update Message Keys
- All new UI text goes in JSON as message keys
- Provide translations for all supported locales
- Test missing key detection

### 7. Document with UUIDs
- Reference spec record UUIDs in code comments
- Link generated artifacts back to specs
- Maintain traceability

---

## Code Review Checklist

Before submitting code, verify:

- [ ] New specs have UUIDs (RFC 4122, valid, unique)
- [ ] New specs have complete search metadata (title/summary/keywords)
- [ ] Commands use arrays, not shell strings
- [ ] Core logic is pure (no I/O)
- [ ] Adapters handle I/O explicitly
- [ ] Platform checks present where needed
- [ ] Risk metadata for destructive/network ops
- [ ] Every class implements interface or extends base class
- [ ] ≤3 public methods per class (excluding constructors)
- [ ] ≤10 lines per function (strict)
- [ ] 100% test coverage maintained
- [ ] Message keys used (no hardcoded strings)
- [ ] Generated artifacts regenerated
- [ ] Cross-platform CI passes (win/mac/linux)
- [ ] WebUI search works for new components
- [ ] Monaco editor validates new JSON schemas
- [ ] Documentation updated (auto-generated or manual)

---

## Example: Adding a New Tool (curl)

### Step 1: Add Spec to JSON
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "id": "tool.dev.curl",
  "type": "tool",
  "search": {
    "title": "cURL",
    "summary": "Command-line tool for transferring data with URLs",
    "keywords": ["http", "download", "api", "rest", "web"],
    "tags": ["network", "cli", "essential"],
    "aliases": ["curl"],
    "domain": "tooling",
    "capabilities": ["http-client", "file-transfer", "api-testing"]
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "install": {
    "linux": {
      "apt": ["apt-get", "install", "-y", "curl"],
      "snap": ["snap", "install", "curl"]
    },
    "mac": {"brew": ["brew", "install", "curl"]},
    "win": {
      "choco": ["choco", "install", "curl", "-y"],
      "winget": ["winget", "install", "cURL.cURL"]
    }
  },
  "verify": {
    "linux": ["curl", "--version"],
    "mac": ["curl", "--version"],
    "win": ["curl", "--version"]
  },
  "help": {
    "linux": ["curl", "--help"],
    "mac": ["curl", "--help"],
    "win": ["curl", "--help"]
  },
  "oneLiners": [
    {
      "id": "get-request",
      "description": "msg.tool.curl.oneliner.get",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "GET", "{url}"]
    },
    {
      "id": "post-json",
      "description": "msg.tool.curl.oneliner.post",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", "{data}", "{url}"]
    }
  ],
  "options": [
    {"flag": "-X", "description": "msg.tool.curl.opt.method", "platforms": {...}},
    {"flag": "-H", "description": "msg.tool.curl.opt.header", "platforms": {...}},
    {"flag": "-d", "description": "msg.tool.curl.opt.data", "platforms": {...}}
  ],
  "dependencies": [],
  "risks": {
    "destructive": false,
    "network": true,
    "confirmation": "msg.tool.curl.risk.network"
  }
}
```

### Step 2: Add Message Keys
```json
{
  "messageKeys": {
    "msg.tool.curl.oneliner.get": {
      "en": "Perform HTTP GET request",
      "es": "Realizar solicitud HTTP GET"
    },
    "msg.tool.curl.oneliner.post": {
      "en": "Perform HTTP POST with JSON data",
      "es": "Realizar solicitud HTTP POST con datos JSON"
    },
    "msg.tool.curl.opt.method": {
      "en": "Specify request method",
      "es": "Especificar método de solicitud"
    },
    "msg.tool.curl.opt.header": {
      "en": "Add custom header",
      "es": "Agregar encabezado personalizado"
    },
    "msg.tool.curl.opt.data": {
      "en": "Send data in request body",
      "es": "Enviar datos en el cuerpo de la solicitud"
    },
    "msg.tool.curl.risk.network": {
      "en": "This operation will make network requests. Continue?",
      "es": "Esta operación realizará solicitudes de red. ¿Continuar?"
    }
  }
}
```

### Step 3: Assign to Registry
Ensure `tool.dev.curl` is included in `DevWorkflowRegistry` within `ToolingAggregate`.

In the spec structure:
```json
{
  "registries": {
    "DevWorkflowRegistry": {
      "tools": [
        "tool.dev.git",
        "tool.dev.curl",
        "tool.dev.docker",
        "..."
      ]
    }
  }
}
```

### Step 4: Regenerate All Artifacts
```bash
codegen generate --all
```

This produces:
- Updated CLI with `codegen tool install curl` command
- Updated WebUI with curl in tool catalog
- Updated search index (searches for "http", "api", "curl" now find this tool)
- Updated registries with curl entry
- Test fixtures for curl

### Step 5: Write Tests

#### Unit Test (Python example)
```python
import pytest
from codegen.core.registry import ToolsRegistry
from codegen.core.models import Tool

def test_curl_spec_valid():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool is not None
    assert tool.uuid == "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    assert tool.search.title == "cURL"
    assert "http" in tool.search.keywords
    assert tool.risks.network is True
    assert tool.risks.destructive is False

def test_curl_platforms():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool.platforms.linux is True
    assert tool.platforms.mac is True
    assert tool.platforms.win is True

def test_curl_install_commands():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    # Linux
    assert tool.install.linux.apt == ["apt-get", "install", "-y", "curl"]
    assert tool.install.linux.snap == ["snap", "install", "curl"]
    
    # macOS
    assert tool.install.mac.brew == ["brew", "install", "curl"]
    
    # Windows
    assert tool.install.win.choco == ["choco", "install", "curl", "-y"]
    assert tool.install.win.winget == ["winget", "install", "cURL.cURL"]
```

#### Integration Test
```python
def test_curl_install_plan_linux():
    planner = InstallPlanner.from_spec("specs.json")
    plan = planner.create_install_plan(
        tool_id="tool.dev.curl",
        platform="linux",
        package_manager="apt"
    )
    
    assert len(plan.steps) == 1
    assert plan.steps[0].command == ["apt-get", "install", "-y", "curl"]
    assert plan.steps[0].requires_confirmation is True  # network risk

def test_curl_searchable():
    search_engine = SearchEngine.from_spec("specs.json")
    
    results = search_engine.search("http client")
    tool_ids = [r.id for r in results]
    
    assert "tool.dev.curl" in tool_ids
    
def test_curl_reachable_from_root():
    root = RootAggregate.from_spec("specs.json")
    
    tooling = root.get_child("tooling")
    dev_workflow = tooling.get_child("dev-workflow")
    curl = dev_workflow.get("tool.dev.curl")
    
    assert curl is not None
    assert curl.id == "tool.dev.curl"
```

#### Cross-Platform Test
```python
@pytest.mark.parametrize("platform", ["linux", "mac", "win"])
def test_curl_verify_command(platform):
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    verify_cmd = tool.verify.get_for_platform(platform)
    assert verify_cmd == ["curl", "--version"]
```

### Step 6: Verify in WebUI
1. Start dev server: `npm run dev` (in generated WebUI directory)
2. Navigate to `http://localhost:3000`
3. Search for "curl" → tool appears in results
4. Click tool → view details page showing:
   - UUID, ID, search metadata
   - Platform support
   - Install commands per platform/package manager
   - One-liners
   - Options
   - Risk warnings
5. Select "Generate Runbook" → add curl to plan → export

### Step 7: Verify in CLI
```bash
# Search
$ codegen search "http client"
Found 3 results:
1. tool.dev.curl - cURL (Command-line tool for transferring data with URLs)
2. tool.dev.httpie - HTTPie (Human-friendly HTTP client)
3. tool.dev.wget - Wget (Non-interactive network downloader)

# Describe
$ codegen describe tool.dev.curl
UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
ID: tool.dev.curl
Title: cURL
Summary: Command-line tool for transferring data with URLs
Platforms: linux, mac, win
Risks: network
Keywords: http, download, api, rest, web

Install Commands:
  Linux (apt): apt-get install -y curl
  macOS (brew): brew install curl
  Windows (choco): choco install curl -y

# Install
$ codegen tool install curl --platform=linux --package-manager=apt
[WARNING] This operation will make network requests. Continue? (y/N): y
[INFO] Installing curl via apt...
[INFO] Running: apt-get install -y curl
[SUCCESS] curl installed successfully

# Verify
$ codegen tool verify curl
[INFO] Verifying curl installation...
[INFO] Running: curl --version
curl 7.81.0 (x86_64-pc-linux-gnu)
[SUCCESS] curl is installed and working
```

---

## Example: CI/CD Pipeline Plugin Integration

This example demonstrates how multiple plugins work together to create a complete CI/CD environment.

### Scenario: Setting Up a Kubernetes CI/CD Pipeline

#### 1. Profile Definition
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "id": "profile.devops-engineer",
  "type": "profile",
  "search": {
    "title": "DevOps Engineer",
    "summary": "Complete CI/CD and container orchestration toolkit",
    "keywords": ["devops", "ci-cd", "kubernetes", "docker", "gitops"],
    "domain": "profiles"
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "overrides": {
    "preferredPackageManager": {
      "linux": "apt",
      "mac": "brew",
      "win": "choco"
    },
    "toolVersions": {
      "tool.container.docker": "24.x",
      "tool.container.kubectl": "1.28.x",
      "tool.cicd.argocd": "2.9.x",
      "tool.iac.terraform": "1.6.x"
    },
    "features": {
      "docker": true,
      "kubernetes": true,
      "gitops": true,
      "iac": true,
      "monitoring": true
    },
    "workspaceRoot": "~/devops",
    "containerRegistry": "ghcr.io"
  },
  "requiredTools": [
    "tool.dev.git",
    "tool.container.docker",
    "tool.container.kubectl",
    "tool.container.helm",
    "tool.cicd.argocd",
    "tool.iac.terraform",
    "tool.cicd.github-actions-runner",
    "tool.security.trivy",
    "tool.dev.jq",
    "tool.dev.yq"
  ]
}
```

#### 2. Runbook Generation
```bash
$ codegen runbook generate --profile=devops-engineer --platform=linux

[INFO] Generating runbook for profile: devops-engineer
[INFO] Target platform: linux
[INFO] Resolving dependencies...

Runbook: DevOps Engineer Setup
================================

Prerequisites:
- Sudo access
- Internet connection
- 8GB RAM minimum
- 50GB free disk space

Step 1: Package Manager Setup
------------------------------
[apt] Update package lists
$ sudo apt-get update

Step 2: Core Development Tools
-------------------------------
[git] Install Git version control
$ sudo apt-get install -y git
Verify: git --version

Step 3: Container Runtime
--------------------------
[docker] Install Docker Engine
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh
$ sudo usermod -aG docker $USER
Verify: docker --version
Post-install: Log out and back in for group changes

[docker-compose] Install Docker Compose V2
$ sudo apt-get install -y docker-compose-plugin
Verify: docker compose version

Step 4: Kubernetes Tools
-------------------------
[kubectl] Install Kubernetes CLI
$ curl -LO "https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
$ sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
Verify: kubectl version --client

[helm] Install Helm package manager
$ curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
Verify: helm version

[k3d] Install k3d for local clusters
$ wget -q -O - https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
Verify: k3d version

Step 5: GitOps & CD Tools
--------------------------
[argocd] Install ArgoCD CLI
$ curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
Verify: argocd version

Step 6: Infrastructure as Code
-------------------------------
[terraform] Install Terraform
$ wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
$ echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
$ sudo apt-get update && sudo apt-get install -y terraform
Verify: terraform version

Step 7: CI/CD Runners
----------------------
[github-actions-runner] Install GitHub Actions self-hosted runner
$ mkdir -p ~/actions-runner && cd ~/actions-runner
$ curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
$ tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
Note: Configure with: ./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN

Step 8: Security Tools
-----------------------
[trivy] Install Trivy vulnerability scanner
$ wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
$ echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
$ sudo apt-get update && sudo apt-get install -y trivy
Verify: trivy version

Step 9: Utilities
------------------
[jq] Install JSON processor
$ sudo apt-get install -y jq
Verify: jq --version

[yq] Install YAML processor
$ wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
$ chmod +x /usr/local/bin/yq
Verify: yq --version

Step 10: Verification
----------------------
Running full verification suite...
✓ git installed (version 2.34.1)
✓ docker installed (version 24.0.7)
✓ docker-compose installed (version 2.23.0)
✓ kubectl installed (version 1.28.0)
✓ helm installed (version 3.13.0)
✓ k3d installed (version 5.6.0)
✓ argocd installed (version 2.9.0)
✓ terraform installed (version 1.6.4)
✓ trivy installed (version 0.47.0)
✓ jq installed (version 1.6)
✓ yq installed (version 4.35.2)

All tools successfully installed!

Next Steps:
-----------
1. Create a local Kubernetes cluster:
   $ k3d cluster create dev-cluster

2. Deploy ArgoCD to the cluster:
   $ kubectl create namespace argocd
   $ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

3. Configure GitHub Actions runner:
   $ cd ~/actions-runner
   $ ./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN
   $ ./run.sh

4. Initialize Terraform workspace:
   $ cd ~/devops
   $ terraform init

Export runbook? (markdown/json/shell): 
```

#### 3. Template Usage: GitHub Actions + Docker + Kubernetes
```bash
$ codegen template generate github-actions-docker-k8s --output=./myapp

[INFO] Generating template: github-actions-docker-k8s
[INFO] Output directory: ./myapp
[INFO] Using profile: devops-engineer

Generated files:
./myapp/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Build and test
│       ├── cd.yml                 # Deploy to k8s
│       └── security-scan.yml      # Trivy scanning
├── k8s/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   ├── overlays/
│   │   ├── dev/
│   │   │   └── kustomization.yaml
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   └── prod/
│   │       └── kustomization.yaml
│   └── argocd/
│       └── application.yaml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── skaffold.yaml
└── README.md

[SUCCESS] Template generated successfully!
```

#### 4. Generated GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
# Auto-generated by codegen template: github-actions-docker-k8s
# Profile: devops-engineer
# Plugins: github-actions, docker, kubectl, trivy

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
  
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run tests
        run: |
          docker compose -f docker-compose.test.yml up --abort-on-container-exit
          docker compose -f docker-compose.test.yml down
```

#### 5. Generated CD Workflow (.github/workflows/cd.yml)
```yaml
# Auto-generated by codegen template: github-actions-docker-k8s
# Profile: devops-engineer
# Plugins: github-actions, docker, kubectl, argocd

name: CD Pipeline

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Update Kubernetes manifests
        run: |
          cd k8s/overlays/prod
          kustomize edit set image ghcr.io/${{ github.repository }}:${{ github.sha }}
      
      - name: Commit manifest changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add k8s/
          git commit -m "Update image to ${{ github.sha }}" || echo "No changes"
          git push
      
      - name: Sync ArgoCD application
        run: |
          argocd app sync myapp --grpc-web
        env:
          ARGOCD_SERVER: ${{ secrets.ARGOCD_SERVER }}
          ARGOCD_AUTH_TOKEN: ${{ secrets.ARGOCD_TOKEN }}
```

#### 6. CLI Workflow Example
```bash
# Install all tools for DevOps profile
$ codegen profile apply devops-engineer
[INFO] Applying profile: devops-engineer
[INFO] Installing 11 required tools...
[INFO] This will install: git, docker, kubectl, helm, k3d, argocd, terraform, github-actions-runner, trivy, jq, yq
Continue? (y/N): y

[1/11] Installing git...
[2/11] Installing docker...
[3/11] Installing kubectl...
# ... (progress continues)

[SUCCESS] All tools installed!

# Verify all tools
$ codegen profile verify devops-engineer
[INFO] Verifying profile: devops-engineer
✓ git (version 2.34.1)
✓ docker (version 24.0.7)
✓ kubectl (version 1.28.0)
# ... (all tools verified)

[SUCCESS] All tools verified!

# Create a new project with CI/CD pipeline
$ codegen project create myapp \
  --template=github-actions-docker-k8s \
  --profile=devops-engineer \
  --registry=ghcr.io/myorg/myapp

[INFO] Creating project: myapp
[INFO] Template: github-actions-docker-k8s
[INFO] Profile: devops-engineer
[INFO] Container registry: ghcr.io/myorg/myapp

Generated project structure:
✓ GitHub Actions workflows (CI/CD)
✓ Kubernetes manifests (base + overlays)
✓ ArgoCD application
✓ Dockerfile + docker-compose
✓ Skaffold configuration

[SUCCESS] Project created at ./myapp

Next steps:
1. cd myapp
2. git init && git add . && git commit -m "Initial commit"
3. git remote add origin https://github.com/myorg/myapp.git
4. git push -u origin main
5. Configure ArgoCD to watch this repository
6. Push code to trigger CI/CD pipeline

# Generate runbook for team onboarding
$ codegen runbook generate \
  --profile=devops-engineer \
  --platform=linux \
  --format=markdown \
  --output=ONBOARDING.md

[SUCCESS] Runbook saved to ONBOARDING.md
```

This example demonstrates:
- **Multiple plugins working together** (GitHub Actions, Docker, kubectl, ArgoCD, Terraform, Trivy)
- **Profile-driven configuration** (DevOps Engineer profile)
- **Template generation** (CI/CD pipeline with security scanning)
- **Runbook automation** (Repeatable environment setup)
- **Cross-tool integration** (All tools configured to work as a cohesive system)

---

## Recommended Additional Tools

Beyond the initial list, strongly consider adding:

### CI/CD & DevOps Essentials
- **GitHub Actions**: CLI and runner tools
- **GitLab CI**: Runner and pipeline tools
- **Jenkins**: Server and CLI
- **CircleCI**: CLI and local executor
- **Azure DevOps**: CLI and pipelines
- **Travis CI**: CLI
- **ArgoCD**: GitOps CD for Kubernetes
- **Flux**: GitOps toolkit
- **Spinnaker**: Multi-cloud CD platform
- **Tekton**: Kubernetes-native CI/CD

### Container Ecosystem (Comprehensive)
- **Docker Variants**:
  - Docker Desktop (Win/Mac)
  - Docker Engine (Linux)
  - Docker CE/EE
  - Colima (macOS Docker alternative)
  - Rancher Desktop
  - OrbStack (macOS)
- **Container Build Tools**:
  - buildx (Docker multi-platform builds)
  - buildkit (improved build backend)
  - kaniko (in-cluster container builds)
  - buildah (OCI container builder)
  - img (standalone daemon-less builds)
- **Container Runtimes**:
  - containerd
  - cri-o
  - podman
  - lxc/lxd
- **Container Security**:
  - trivy (vulnerability scanner)
  - clair (static analysis)
  - anchore (deep image inspection)
  - snyk (security scanning)
  - docker-bench-security (CIS benchmark)
  - hadolint (Dockerfile linter)
- **Container Management**:
  - portainer (web UI)
  - lazydocker (terminal UI)
  - ctop (container top)
  - dive (image layer analyzer)
  - dry (interactive CLI)

### Kubernetes & Orchestration
- **Kubernetes Variants**:
  - kubectl (CLI)
  - k3s (lightweight k8s)
  - k3d (k3s in docker)
  - minikube (local k8s)
  - kind (k8s in docker)
  - microk8s (lightweight k8s)
  - rancher (k8s management)
  - openshift (enterprise k8s)
- **Kubernetes Tools**:
  - helm (package manager)
  - helmfile (declarative helm)
  - kustomize (config management)
  - skaffold (dev workflow)
  - tilt (local dev)
  - devspace (dev environment)
  - telepresence (local-to-cluster bridge)
  - stern (multi-pod log tailing)
  - k9s (terminal UI)
  - kubectx/kubens (context/namespace switcher)
  - krew (kubectl plugin manager)
- **Service Mesh**:
  - istio
  - linkerd
  - consul
  - envoy

### Infrastructure as Code
- **Provisioning**:
  - terraform
  - terragrunt (terraform wrapper)
  - pulumi (multi-language IaC)
  - crossplane (k8s-native IaC)
  - opentofu (terraform fork)
- **Configuration Management**:
  - ansible
  - chef
  - puppet
  - saltstack
- **Cloud-Specific**:
  - AWS CloudFormation
  - Azure ARM Templates / Bicep
  - Google Deployment Manager
  - AWS CDK
  - Azure CDK

### Container Registry Tools
- **Registry CLIs**:
  - docker login/push/pull
  - crane (go-containerregistry CLI)
  - skopeo (image operations)
  - regctl (registry client)
- **Registry Servers**:
  - Harbor
  - Quay
  - JFrog Artifactory
  - Nexus Repository
  - GitLab Container Registry
  - GitHub Container Registry (ghcr)

### Monitoring & Observability (for CI/CD)
- **Metrics**:
  - prometheus
  - grafana
  - datadog-agent
  - newrelic-agent
- **Logging**:
  - fluentd
  - logstash
  - vector
  - promtail
- **Tracing**:
  - jaeger
  - zipkin
  - tempo
- **APM**:
  - elastic-apm
  - opentelemetry

### Shell/Terminal Tools
- **bash**, **zsh**, **fish**: Shell environments
- **powershell**: Windows automation baseline
- **windows-terminal**: Modern Windows terminal
- **tmux**, **screen**: Terminal multiplexers
- **oh-my-zsh**, **oh-my-posh**: Shell frameworks

### Archive/Compression Tools
- **tar**: Archive utility
- **zip**, **unzip**: ZIP compression
- **7zip**: Multi-format archiver
- **gzip**, **bzip2**: Compression utilities

### Text Processing Tools
- **jq**: JSON processor
- **yq**: YAML processor
- **grep**, **sed**, **awk**: Text manipulation (Linux/macOS)
- **ripgrep** (rg): Fast grep alternative
- **fzf**: Fuzzy finder
- **bat**: Better cat with syntax highlighting
- **fd**: Better find alternative

### Security/Crypto Tools
- **openssl**: TLS/crypto toolkit
- **gpg**: GNU Privacy Guard
- **ssh-keygen**: SSH key generation
- **age**: Modern encryption tool
- **vault**: HashiCorp Vault (secrets management)
- **sops**: Secrets operations
- **sealed-secrets**: Kubernetes secrets

### Version Managers
- **nvm**, **fnm**: Node version managers
- **pyenv**: Python version manager
- **rbenv**: Ruby version manager
- **rustup**: Rust toolchain manager
- **sdkman**: JVM version manager
- **asdf**: Universal version manager
- **tfenv**: Terraform version manager
- **kenv**: kubectl version manager

### Cloud CLI Tools
- **aws-cli**: AWS command line
- **gcloud**: Google Cloud CLI
- **azure-cli**: Azure command line
- **doctl**: DigitalOcean CLI
- **linode-cli**: Linode CLI
- **ibmcloud**: IBM Cloud CLI

### Tunneling/Networking Tools
- **ngrok**: Expose localhost to internet
- **cloudflared**: Cloudflare tunnel
- **localtunnel**: Expose localhost
- **tailscale**: VPN mesh network
- **wireguard**: Modern VPN
- **mkcert**: Local HTTPS certificates
- **inlets**: Tunnel services to any network

### Database CLI Clients
- **psql**: PostgreSQL client
- **mysql**: MySQL client
- **sqlite3**: SQLite CLI
- **redis-cli**: Redis client
- **mongosh**: MongoDB shell
- **influx**: InfluxDB CLI
- **cockroach**: CockroachDB CLI

### Monitoring/System Tools
- **htop**, **btop**: Interactive process viewers
- **glances**: System monitoring
- **ncdu**: Disk usage analyzer
- **dstat**, **iostat**: System statistics
- **nethogs**: Network bandwidth per process
- **iftop**: Network bandwidth monitoring

### Development Utilities
- **gh**: GitHub CLI
- **glab**: GitLab CLI
- **watchman**: File watching service
- **entr**: Run commands when files change
- **direnv**: Environment switcher
- **asdf**: Universal version manager
- **pre-commit**: Git hook framework
- **commitizen**: Commit message formatter
- **semantic-release**: Automated versioning

### Testing & Quality Tools
- **sonarqube**: Code quality
- **codecov**: Coverage reporting
- **eslint**, **prettier**: JS linting/formatting
- **pylint**, **black**: Python linting/formatting
- **rustfmt**, **clippy**: Rust formatting/linting
- **shellcheck**: Shell script linting

All follow the same UUID + spec + registry + plugin pattern.

---

## Operational Principles Summary

### For AI Agents: The Ten Commandments

1. **Single Source of Truth**: All behavior derives from specs (plugin spec.json + manifest)
2. **Dataclass-First**: Every component is a structured, typed entity
3. **Lifecycle-Driven**: `initialise()` → `execute()` → `shutdown()`
4. **Interface/Base Required**: No naked concrete classes
5. **Method Limits**: ≤3 public methods, ≤10 lines per function
6. **Registry-Registered**: Everything discoverable via aggregates
7. **UUID-Identified**: RFC 4122 for every record
8. **Search-Indexed**: Complete metadata for discoverability
9. **i18n-Ready**: Message keys, never hardcoded strings
10. **100% Coverage**: No untested code, ever
11. **Plugin-Based**: One plugin per tool, clean hierarchy, full tests

### When In Doubt
1. Check the plugin spec first (spec.json + plugin.json)
2. Is it a spec change or plugin implementation change?
3. Should this be a new plugin or modification to existing?
4. Will this be testable?
5. Does this respect the adapter boundary?
6. Is this discoverable via registries?
7. Are message keys used?
8. Is the method/line limit respected?
9. Does the component implement an interface/base class?
10. Does the plugin have 100% test coverage?

### Quality Gates (Non-Negotiable)
- [ ] 100% test coverage (lines, branches, functions, statements)
- [ ] All classes implement interface or extend base class
- [ ] ≤3 public methods per class
- [ ] ≤10 lines per function
- [ ] No hardcoded user-facing strings
- [ ] All components registered in appropriate registry
- [ ] All UUIDs valid and unique
- [ ] All search metadata complete
- [ ] Cross-platform tests pass (win/mac/linux)
- [ ] Generated artifacts are up-to-date
- [ ] Each plugin has proper directory structure
- [ ] Each plugin has complete plugin.json manifest
- [ ] Each plugin has 100% test coverage
- [ ] Each plugin has README.md documentation

---

## Glossary

**Adapter**: Boundary layer that handles I/O (filesystem, network, shell execution). Core logic never touches adapters directly; adapters are injected.

**Aggregate**: Hierarchical container grouping registries and sub-aggregates. Supports drill-down navigation (`list_children()`, `get_child()`).

**Component**: Dataclass-first entity with lifecycle methods. Must implement interface or extend base class.

**Core**: Pure, deterministic business logic. No I/O, no side effects. Testable in isolation. Minimal implementation; most capabilities come from plugins.

**Dataclass-First**: Components defined as structured data classes with explicit fields, validation, and lifecycle methods.

**Deterministic**: Same inputs always produce same outputs. Critical for reproducibility and testing.

**Drill-Down Navigation**: Traversing the aggregate tree from root to leaf, discovering capabilities along the way.

**Lifecycle Methods**: Standard contract methods: `initialise()`, `execute()`, `validate()`, `describe()`, `shutdown()`.

**Lockfile**: JSON artifact with resolved, pinned versions of tools/dependencies. Ensures reproducibility.

**Message Key**: i18n/L10n identifier for user-facing text. Format: `msg.domain.component.field`.

**One-Liner**: Common command pattern for a tool, parameterized for reuse (e.g., `git clone {url}`).

**Plugin**: Self-contained, isolated extension that provides capabilities (tools, languages, templates, profiles). One plugin per tool. Each plugin has its own directory with manifest, spec, messages, implementation, and tests.

**Plugin Manifest**: `plugin.json` file describing plugin metadata, dependencies, entry point, and capabilities.

**Profile**: User/project-specific overrides for tool versions, package managers, workspace locations, feature flags.

**Registry**: Read-only index mapping stable IDs/UUIDs to components. Immutable after construction.

**Runbook**: Generated installation/setup plan for a specific platform + profile + tool set. Exportable as Markdown/JSON/shell script.

**Search Metadata**: Structured data for discoverability: title, summary, keywords, tags, aliases, capabilities.

**Spec Record**: JSON entity with UUID, ID, search metadata, and domain-specific fields (tool, profile, snippet, etc.). Each plugin has its own spec.json.

**Tool Plugin**: Plugin that provides a single tool with install/verify/help commands, one-liners, options, platform support, risk metadata. One directory per tool.

**UUID**: RFC 4122 universally unique identifier. Every discoverable entity has one.

---

## Final Notes

This platform is **not** a collection of scripts. It is a **spec-driven, plugin-based system** for:

- Generating cross-platform tooling orchestrators
- Discovering and searching tools via registries/aggregates
- Creating reproducible development environments
- Building CLI and WebUI experiences from plugins
- **Extending capabilities through isolated, testable plugins**

**Everything is:**
- Searchable (via metadata)
- Discoverable (via registries/aggregates)
- Deterministic (same inputs → same outputs)
- Testable (100% coverage, always)
- Extensible (create plugin, write tests, done)
- Spec-Driven (modify plugin specs, not core)
- **Plugin-Based (one plugin per tool, clean hierarchy)**

**Core is minimal. Plugins provide capabilities.**

**When working on this project:**
- Decide: does this belong in core or a plugin?
- If it's a tool, create a new plugin
- Add plugin specs (plugin.json + spec.json + messages.json)
- Implement plugin class and platform installers
- Write tests (100% coverage)
- Register with appropriate registry
- Make it discoverable
- Document in plugin README.md

**Plugin Directory Structure:**
```
plugins/
├── tools/              # One directory per tool
│   ├── git/
│   ├── docker/
│   └── curl/
├── languages/          # Language generators
├── templates/          # Project templates
└── profiles/           # User profiles
```

### Code Generation Requirements

**Resist urge to hardcode strings, codegen should generate docstrings for all classes and methods.**

**Every file should have a class in it.**

**Codegen should make a docs folder in project root with README.md files in each folder and API docs that are in nested folders (also markdown), Table of contents, Navigation, back and forward links and all the usual stuff in there.**

**Doc templates are stored in json, one string per line in a list/array.**

### Public Method Count Rule (Clarified)

The ≤3 public method limit applies **only to domain-level methods**.

The following methods are **explicitly excluded** from the count:
- Lifecycle methods:
  - `initialise()`
  - `execute(...)`
  - `validate(...)`
  - `shutdown()`
- Constructors (`__init__`, language equivalents)
- Interface-mandated overrides
- Language-required dunder / magic methods

These methods are considered **structural contract surface**, not public API surface.

**Note**: If you have the lifecycle methods, you don't really need any other methods.

**This is the way.**

[tool.pylint.main]
max-line-length = 100
max-args = 3
max-locals = 10
max-attributes = 10
max-public-methods = 3
```

```python
# Generated: scripts/lint.py (NOT bash!)
#!/usr/bin/env python3
"""Lint runner for Python code."""
import subprocess
import sys
from pathlib import Path

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True, cwd=Path(__file__).parent.parent)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main() -> None:
    """Run all lint checks."""
    print("Running ruff...")
    run(["ruff", "check", "."])
    
    print("Running mypy...")
    run(["mypy", "."])
    
    print("Running black check...")
    run(["black", "--check", "."])
    
    print("Running pylint...")
    run(["pylint", "src/"])
    
    print("✓ All lint checks passed")

if __name__ == "__main__":
    main()
```

#### Rust
```toml
# Generated: rustfmt.toml
max_width = 100
hard_tabs = false
tab_spaces = 4
newline_style = "Unix"
use_small_heuristics = "Off"
fn_params_layout = "Tall"
brace_style = "SameLineWhere"
control_brace_style = "AlwaysSameLine"
trailing_comma = "Vertical"
match_block_trailing_comma = true
blank_lines_upper_bound = 1
blank_lines_lower_bound = 0
edition = "2021"
merge_derives = true
use_try_shorthand = true
use_field_init_shorthand = true
force_explicit_abi = true
condense_wildcard_suffixes = true
normalize_comments = true
normalize_doc_attributes = true
format_code_in_doc_comments = true
wrap_comments = true
comment_width = 100
```

```toml
# Generated: Cargo.toml (partial)
[lints.rust]
unsafe_code = "forbid"
missing_docs = "warn"
unused_results = "warn"

[lints.clippy]
all = "warn"
pedantic = "warn"
nursery = "warn"
cargo = "warn"
```

```python
# Generated: scripts/lint.py (cross-platform!)
#!/usr/bin/env python3
"""Lint runner for Rust code."""
import subprocess
import sys

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main() -> None:
    """Run all lint checks."""
    print("Running cargo fmt check...")
    run(["cargo", "fmt", "--", "--check"])
    
    print("Running clippy...")
    run(["cargo", "clippy", "--", "-D", "warnings"])
    
    print("Running cargo check...")
    run(["cargo", "check"])
    
    print("✓ All lint checks passed")

if __name__ == "__main__":
    main()
```

#### Go
```yaml
# Generated: .golangci.yml
linters:
  enable-all: true
  disable:
    - exhaustivestruct  # Too strict for some cases
    - gochecknoglobals  # Sometimes necessary
    
linters-settings:
  gofmt:
    simplify: true
  gocyclo:
    min-complexity: 5
  funlen:
    lines: 10
    statements: 10
  gomnd:
    settings:
      mnd:
        checks: argument,case,condition,operation,return,assign
  govet:
    check-shadowing: true
    enable-all: true

issues:
  max-issues-per-linter: 0
  max-same-issues: 0
```

```python
# Generated: scripts/lint.py
#!/usr/bin/env python3
"""Lint runner for Go code."""
import subprocess
import sys

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main() -> None:
    """Run all lint checks."""
    print("Running gofmt check...")
    run(["gofmt", "-l", "-s", "."])
    
    print("Running go vet...")
    run(["go", "vet", "./..."])
    
    print("Running golangci-lint...")
    run(["golangci-lint", "run", "--config", ".golangci.yml"])
    
    print("Running staticcheck...")
    run(["staticcheck", "./..."])
    
    print("✓ All lint checks passed")

if __name__ == "__main__":
    main()
```

#### C/C++
```yaml
# Generated: .clang-format
Language: Cpp
Standard: c++17
BasedOnStyle: Google
IndentWidth: 2
ColumnLimit: 100
PointerAlignment: Left
AllowShortFunctionsOnASingleLine: None
AllowShortIfStatementsOnASingleLine: Never
AllowShortLoopsOnASingleLine: false
AlwaysBreakTemplateDeclarations: Yes
BreakBeforeBraces: Attach
```

```yaml
# Generated: .clang-tidy
Checks: '*,-fuchsia-*,-google-readability-todo,-llvmlibc-*'
WarningsAsErrors: '*'
HeaderFilterRegex: '.*'
CheckOptions:
  - key: readability-function-cognitive-complexity.Threshold
    value: '5'
  - key: readability-function-size.LineThreshold
    value: '10'
  - key: misc-non-private-member-variables-in-classes.IgnoreClassesWithAllMemberVariablesBeingPublic
    value: '1'
```

```python
# Generated: scripts/lint.py
#!/usr/bin/env python3
"""Lint runner for C++ code."""
import subprocess
import sys
from pathlib import Path

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main() -> None:
    """Run all lint checks."""
    cpp_files = list(Path(".").rglob("*.cpp")) + list(Path(".").rglob("*.hpp"))
    
    print("Running clang-format check...")
    for file in cpp_files:
        run(["clang-format", "--dry-run", "--Werror", str(file)])
    
    print("Running clang-tidy...")
    for file in cpp_files:
        run(["clang-tidy", str(file), "--", "-std=c++17"])
    
    print("Running cppcheck...")
    run(["cppcheck", "--enable=all", "--error-exitcode=1", "."])
    
    print("✓ All lint checks passed")

if __name__ == "__main__":
    main()
```

#### Java
```xml
<!-- Generated: checkstyle.xml -->
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">
<module name="Checker">
  <module name="TreeWalker">
    <module name="MethodLength">
      <property name="max" value="10"/>
    </module>
    <module name="ParameterNumber">
      <property name="max" value="3"/>
    </module>
    <module name="CyclomaticComplexity">
      <property name="max" value="5"/>
    </module>
    <module name="NPathComplexity">
      <property name="max" value="10"/>
    </module>
  </module>
</module>
```

```xml
<!-- Generated: pom.xml (partial) -->
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-checkstyle-plugin</artifactId>
      <version>3.3.0</version>
      <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failOnViolation>true</failOnViolation>
        <violationSeverity>warning</violationSeverity>
      </configuration>
      <executions>
        <execution>
          <goals>
            <goal>check</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

```python
# Generated: scripts/lint.py
#!/usr/bin/env python3
"""Lint runner for Java code."""
import subprocess
import sys

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main() -> None:
    """Run all lint checks."""
    print("Running checkstyle...")
    run(["mvn", "checkstyle:check"])
    
    print("Running spotbugs...")
    run(["mvn", "spotbugs:check"])
    
    print("Running PMD...")
    run(["mvn", "pmd:check"])
    
    print("✓ All lint checks passed")

if __name__ == "__main__":
    main()
```

### Pre-Commit Hook Integration (MANDATORY)

Generate language-native pre-commit hooks (NO SHELL SCRIPTS):

```python
# Generated: scripts/pre_commit.py
#!/usr/bin/env python3
"""Pre-commit hook runner (cross-platform)."""
import subprocess
import sys
from pathlib import Path

def main() -> None:
    """Run pre-commit checks."""
    print("Running pre-commit checks...")
    
    # Run lint script
    lint_script = Path(__file__).parent / "lint.py"
    try:
        subprocess.run([sys.executable, str(lint_script)], check=True)
    except subprocess.CalledProcessError:
        print("❌ Pre-commit checks failed")
        print("Run 'python scripts/lint.py' to see errors")
        sys.exit(1)
    
    print("✅ Pre-commit checks passed")

if __name__ == "__main__":
    main()
```

```python
# Generated: scripts/install_hooks.py
#!/usr/bin/env python3
"""Install git hooks (cross-platform)."""
import shutil
import sys
from pathlib import Path

def main() -> None:
    """Install git hooks."""
    git_hooks_dir = Path(".git/hooks")
    if not git_hooks_dir.exists():
        print("Error: Not in a git repository")
        sys.exit(1)
    
    pre_commit_hook = git_hooks_dir / "pre-commit"
    pre_commit_script = Path("scripts/pre_commit.py")
    
    # Create hook that calls Python script
    hook_content = f"""#!/bin/sh
{sys.executable} {pre_commit_script}
"""
    
    pre_commit_hook.write_text(hook_content)
    pre_commit_hook.chmod(0o755)
    
    print("✅ Git hooks installed")
    print(f"   Pre-commit: {pre_commit_hook}")

if __name__ == "__main__":
    main()
```

### Build Tool Integration Examples

#### TypeScript (package.json)
```json
{
  "scripts": {
    "prebuild": "node scripts/lint.js",
    "build": "tsc",
    "test": "jest",
    "lint": "node scripts/lint.js",
    "lint:fix": "eslint . --fix && prettier --write .",
    "prepare": "node scripts/install_hooks.js"
  }
}
```

#### Python (Makefile alternative in Python)
```python
# Generated: scripts/build.py
#!/usr/bin/env python3
"""Build script (replaces Makefile)."""
import subprocess
import sys

def run(command: list[str]) -> None:
    """Run command and exit on failure."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError:
        sys.exit(1)

def lint() -> None:
    """Run linting."""
    run([sys.executable, "scripts/lint.py"])

def test() -> None:
    """Run tests."""
    run(["pytest", "--cov=src", "--cov-report=term-missing", "--cov-fail-under=100"])

def build() -> None:
    """Run full build."""
    lint()
    test()
    run([sys.executable, "-m", "build"])

if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "build"
    
    commands = {
        "lint": lint,
        "test": test,
        "build": build,
    }
    
    if command in commands:
        commands[command]()
    else:
        print(f"Unknown command: {command}")
        print(f"Available: {', '.join(commands.keys())}")
        sys.exit(1)
```

#### Rust (Cargo.toml)
```toml
[package.metadata.scripts]
lint = "python3 scripts/lint.py"
test = "cargo test"
build = "cargo build --release"
```

### Lint Configuration Plugin Structure

Each linting tool should be a plugin:

```
plugins/tools/linters/
├── eslint/
│   ├── plugin.json
│   ├── spec.json
│   ├── configs/                    # Strictest config templates
│   │   ├── typescript.json
│   │   ├── javascript.json
│   │   └── react.json
│   ├── src/
│   │   ├── eslint_plugin.py
│   │   ├── installers/
│   │   └── config_generator.py    # Generates .eslintrc.json
│   └── tests/
├── ruff/
│   ├── plugin.json
│   ├── spec.json
│   ├── configs/
│   │   └── pyproject.toml.template
│   ├── src/
│   └── tests/
├── clippy/
│   ├── plugin.json
│   ├── spec.json
│   ├── configs/
│   │   └── Cargo.toml.template
│   ├── src/
│   └── tests/
└── golangci-lint/
    ├── plugin.json
    ├── spec.json
    ├── configs/
    │   └── .golangci.yml
    ├── src/
    └── tests/
```

### Language Plugin Integration

Language plugins MUST include lint configuration generation:

```
plugins/languages/
├── typescript/
│   ├── plugin.json
│   ├── spec.json
│   ├── templates/
│   │   ├── component.ts.template
│   │   └── interface.ts.template
│   ├── lint_configs/               # MANDATORY
│   │   ├── eslintrc.json
│   │   ├── prettierrc.json
│   │   └── tsconfig.json
│   ├── scripts/                    # MANDATORY (no shell!)
│   │   ├── lint.js
│   │   └── build.js
│   ├── src/
│   │   ├── typescript_generator.py
│   │   └── lint_config_generator.py
│   └── tests/
│       ├── test_generation.py
│       └── test_lint_enforcement.py
```

### CI Integration (GitHub Actions Example)

Generated workflow MUST enforce linting:

```yaml
# Generated: .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # TypeScript example
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: node scripts/lint.js
      
      - name: Run tests
        run: npm test
  
  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

### Quality Gates Summary

Generated projects MUST:
1. ✅ Include strictest lint configs for target language
2. ✅ Use language-native build/lint scripts (Python/JS, NOT shell)
3. ✅ Fail builds on any lint warning
4. ✅ Include pre-commit hooks (installed via language script)
5. ✅ Pass 100% test coverage
6. ✅ Pass all lint checks before commit
7. ✅ Be cross-platform by default
8. ✅ Be fully testable (including build scripts)

---

## Core Architecture Principles

### 1. Single Source of Truth (MANDATORY)
- **One canonical JSON file** defines all specs (e.g., `specs.json`)
- Contains: tool records, profiles, project templates, snippets, message keys, registries, aggregates
- Never hardcode behavior that belongs in specs
- Generator reads JSON → produces artifacts (code, CLI, WebUI, docs, tests)

### 2. Dataclass-First Component Model (MANDATORY)
Every component MUST be:
- A dataclass with explicit fields (language-idiomatic)
- UUID-identified (RFC 4122, field name: `uuid`)
- Search metadata enabled (field name: `search` with title/summary/keywords)
- Lifecycle-aware with standard contract methods
- Platform-scoped where relevant
- Registry/aggregate reachable

### 3. Inheritance/Interface Requirement (MANDATORY)
**No standalone concrete classes allowed.**

Every class MUST either:
- Implement an interface, OR
- Extend a base class (preferred when shared logic exists)

Language-idiomatic contracts:
- **TypeScript**: `implements Interface` or `extends Base`
- **Python**: `abc.ABC` + `Protocol` as appropriate
- **C++**: Pure virtual interface base class
- **Rust**: `trait` + struct implementing trait
- **Go**: Interface type + struct implementation
- **C#**: `Interface` or `abstract class`

### 4. Standard Lifecycle Contract (Component)
Required public methods:
1. `initialise()` → void/Result
   - Prepares runtime state
   - Validates dependencies
   - Loads catalogs/config
   - Ensures readiness

2. `execute(input)` → output
   - Primary operational method (signature language-idiomatic)
   - Must be pure or mediated through injected adapters

Optional public methods (≤3 total public methods including required):
- `validate(input)` → void/Result (no I/O unless at edges)
- `describe()` → string/Descriptor
- `shutdown()` → void/Result (cleanup, edge-only)

### 5. Registry Contract (MANDATORY)
Public methods (≤3):
1. `list_ids()` → list[string]
2. `get(id_or_uuid: string)` → Component/Factory/Descriptor
3. `describe(id_or_uuid: string)` → Descriptor (optional)

Requirements:
- Immutable after construction
- Queryable by stable ID, UUID, and optionally by tags
- Deterministically derived from JSON source of truth
- No global mutable state

### 6. Aggregate Contract (MANDATORY)
Public methods (≤3):
1. `list_children()` → list[string]
2. `get_child(id_or_uuid: string)` → Aggregate|Registry
3. `describe()` → Descriptor (optional)

Requirements:
- Forms hierarchical drill-down tree
- Root aggregate (e.g., `AppAggregate`) contains domain-bounded children
- Supports navigation and capability discovery

### 7. Strict Method & File Constraints (MANDATORY)
- **≤3 public methods per class** (constructors excluded)
- **≤10 lines per function** (strict, no exceptions)
- **One primary class per file**
- If a function exceeds 10 lines, refactor into helper methods

### 8. UUID Requirement (RFC 4122, MANDATORY)
Every discoverable entity MUST include:
- Field name: `uuid`
- Format: RFC 4122 UUID string (8-4-4-4-12 hex)
- Preferred versions:
  - **v4**: Random UUIDs
  - **v5**: Deterministic UUIDs (derived from stable namespace + ID)
- Uniqueness enforced by schema validation and CI tests

### 9. Search Metadata Requirement (MANDATORY)
Every JSON record MUST include:
```json
{
  "uuid": "...",
  "id": "stable.namespaced.id",
  "search": {
    "title": "Short Human Name",
    "summary": "One-paragraph description",
    "keywords": ["array", "of", "terms"],
    "tags": ["optional", "normalized"],
    "aliases": ["synonyms", "optional"],
    "domain": "codegen|adapter|domain|i18n|tooling",
    "capabilities": ["generate", "list", "install"]
  }
}
```

Used by:
- CLI search command
- WebUI full-text search/filter
- Internal component selection logic

### 10. No Raw Shell Strings (MANDATORY)
- Commands MUST be: `["executable", "arg1", "arg2"]` arrays
- Shell wrappers (bash/cmd/PowerShell) only when unavoidable
- Escape/quote handling via platform-specific adapters
- Never use string concatenation for command building

### 11. Execution Boundaries (MANDATORY)
- **Core** = pure, deterministic, testable logic (no I/O)
- **Adapters** = I/O, shell execution, network, filesystem
- Core never touches I/O directly
- All execution mediated through injected adapter interfaces

---

## Registry/Aggregate Structure (MANDATORY)

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

---

## Tooling System (God Tool Capabilities)

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

---

## Security & Safety (MANDATORY)

### Risk Metadata
Mark operations explicitly:
- **Destructive**: `rm -rf`, format, shutdown, data deletion
- **Network**: downloads, API calls, external service communication
- Require explicit confirmation flags in adapters
- Never execute destructive/network ops silently

### Secrets Management
- **NO secrets in specs** (hard constraint)
- Reference secret providers: Keeper, env vars, OS keychain, credential managers
- Adapters handle secret retrieval
- Core logic stays pure, never touches secrets

### Confirmation Flow
```python
# Example adapter pattern
if tool.risks.destructive:
    if not adapter.confirm(message_key=tool.risks.confirmation):
        raise UserCancelledError()
adapter.execute(tool.command)
```

---

## i18n/L10n (Internationalization, MANDATORY)

### Message Key System
- **All user-facing text MUST use message keys**
- No hardcoded strings in code
- Keys in JSON: `"msg.tool.git.summary": "Distributed version control"`
- Generator produces typed accessors per language

### Message Key Structure
```json
{
  "messageKeys": {
    "msg.tool.git.title": {
      "en": "Git",
      "es": "Git",
      "fr": "Git",
      "de": "Git",
      "ja": "Git"
    },
    "msg.tool.git.summary": {
      "en": "Distributed version control system",
      "es": "Sistema de control de versiones distribuido",
      "fr": "Système de contrôle de version distribué",
      "de": "Verteiltes Versionskontrollsystem",
      "ja": "分散バージョン管理システム"
    }
  }
}
```

### Required Locales (Initial)
- en (English) - default/fallback
- es (Spanish)
- fr (French)
- de (German)
- ja (Japanese)

Additional locales added via spec, not code changes.

---

## Next.js WebUI (MANDATORY)

### Requirements
The generated WebUI MUST provide:

#### 1. Tree Navigation
- Renders aggregate drill-down structure
- Expand/collapse nodes
- Select node → show details (descriptor, IDs, UUID, tags, search metadata)
- Breadcrumb navigation

#### 2. Full-Text Search
- Searches across:
  - `search.title`, `search.summary`, `search.keywords`
  - `search.tags`, `search.aliases`
  - `id`, `uuid`
- Provides relevance ranking and highlighting
- Filters by:
  - Domain (codegen, adapter, domain, i18n, tooling)
  - Platform (win, mac, linux)
  - Language (TypeScript, Python, Rust, etc.)
  - Type (tool, profile, snippet, template)

#### 3. Monaco Editor Integration (MANDATORY)
Monaco editor MUST be embedded to:
- View/edit `specs.json` (or split spec files)
- View/edit snippet templates (string[] form) with JSON-aware editing
- View generated previews (read-only) for selected language/snippet
- Support:
  - JSON schema validation (client-side)
  - Syntax highlighting
  - Auto-formatting (Prettier integration)
  - Diff view (comparing profile overrides vs base specs)

#### 4. Preview/Generate Workflow
- Select snippet/group + language → render generated preview
- "Generate" action produces artifact (zip/tarball) via backend API route
- Show diff when modifying specs

#### 5. Runbook Generator
- Select target platform + profile + toolset
- Generate ordered install/verify plan
- Export as:
  - Markdown (human-readable)
  - JSON (machine-readable)
  - Shell script (bash/PowerShell)

#### 6. No Coupling
- WebUI is an adapter
- Core generator remains UI-agnostic
- All WebUI code generated from specs

---

## CLI (MANDATORY)

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
```

### CLI Must Be Generated
- Command structure derived from registries
- Help text from message keys (i18n-ready)
- Auto-completion hints generated
- Platform-aware (adapts to OS)

---

## Testing Requirements (100% Coverage MANDATORY)

### Coverage Target
**100% of lines, branches, functions, statements**
- No exceptions for "hard to test" code
- If untestable, redesign the component

### Test Types (All Required)

#### 1. Unit Tests
- Every component in isolation
- Mock all adapters (no real I/O)
- Test lifecycle methods independently
- Validate dataclass field constraints

#### 2. Integration Tests
- Registry/aggregate navigation
- Search ranking correctness
- Message key resolution
- Profile override application
- Tool installation planning (mocked execution)

#### 3. End-to-End Tests
- Full generation pipeline: spec → artifacts
- CLI command execution (mocked shell)
- WebUI rendering (React Testing Library + Playwright)
- Runbook generation and export

#### 4. Cross-Platform Tests
- Run on Windows, macOS, Linux in CI
- Platform-specific command selection
- Path handling (POSIX vs Windows)
- Cache location resolution

#### 5. Determinism Tests
- Same inputs → identical outputs (hash verification)
- UUID stability across regenerations
- Lockfile reproducibility

#### 6. Contract Conformance Tests
- Every concrete class implements/extends required contract
- Registry/aggregate methods adhere to ≤3 public method limit
- Functions adhere to ≤10 line limit

#### 7. Mandatory Spec Tests
- Registry completeness: generated set equals expected set from spec
- Drill-down reachability: every component reachable from root aggregate
- UUID validity/uniqueness: all records have valid, unique RFC 4122 UUIDs
- Search metadata completeness: all records include required fields
- Message key coverage: no missing translations for default locale

#### 8. WebUI Tests
- Search indexing correctness
- Tree navigation rendering (React Testing Library)
- Monaco editor loads with schema validation enabled
- Preview generation correctness (mocked backend API)
- Responsive design (mobile viewports)

### Test Data
- Fixtures in JSON (spec records for testing)
- Golden files for generated artifacts (CLI help, WebUI routes, code output)
- Snapshot tests for output stability (Jest snapshots)

---

## Code Generation Process

### Multi-Language Support (MANDATORY)

Codegen MUST support multiple target languages:
- **TypeScript/JavaScript**: Full ESM/CommonJS support
- **Python**: Modern Python (3.10+)
- **Rust**: Latest stable Rust
- **Go**: Modern Go (1.20+)
- **Java**: Java 17+ LTS
- **C#**: .NET 6+
- **C/C++**: Modern C++ (C++17+)
- **Kotlin**: JVM/Native support
- **Ruby**: Ruby 3.x
- **PHP**: PHP 8.x

### Generated Code Quality (MANDATORY)

All generated code MUST:
1. **Pass strictest linting** for target language
2. **Follow language idioms** and conventions
3. **Include linting configuration** in generated projects
4. **Be formatted** according to standard formatters
5. **Have zero warnings** at strictest lint level

### Generator Input
- Single JSON file (e.g., `specs.json`)
- Platform target (win/mac/linux/all)
- Optional profile ID
- **Target language(s)** (can generate for multiple languages)
- Optional language filter

### Generator Output
- **CLI**: main + subcommands (Rust/Go/Python, spec-defined)
- **Next.js WebUI**: pages, components, search indices, Monaco integration
- **Registry/Aggregate Tree**: typed, navigable, language-idiomatic
- **Runbook Templates**: Markdown/JSON/shell scripts
- **Message Catalogs**: per locale, typed accessors
- **Test Fixtures**: derived from specs, golden files
- **Documentation**: auto-generated API docs, usage guides
- **Lint Configurations**: strictest settings for all target languages
- **Build Tool Integration**: language-specific build files with lint enforcement

### Generator Properties (MANDATORY)
- **Idempotent**: Regenerate anytime, same output
- **Incremental-friendly**: Only rebuild changed artifacts
- **Self-documenting**: Generated code has comments linking to spec UUIDs
- **Deterministic**: Hash-verifiable outputs
- **Lint-clean**: All generated code passes strictest lints
- **No shell scripts**: Use language-native scripts (Python/JavaScript/etc.) for automation

---

## Common Pitfalls (❌ AVOID THESE)

### ❌ Architecture Violations
- Hardcode tool lists in code (use specs)
- Create classes without interface/base class
- Exceed ≤3 public methods per class
- Exceed ≤10 lines per function
- Use global mutable state (registries must be immutable)
- Skip component registration

### ❌ Execution Violations
- Use raw shell strings: `"apt-get install -y git"`
- Execute I/O from core logic (only in adapters)
- Ignore platform checks (run Linux cmds on Windows)
- Skip platform scoping in tool specs

### ❌ Security Violations
- Embed secrets in specs
- Execute destructive ops without risk metadata
- Skip confirmation for network operations
- Store passwords/API keys in JSON

### ❌ Testing Violations
- Skip tests ("I'll add them later")
- Accept <100% coverage
- Mock insufficiently (real I/O in unit tests)
- Ignore cross-platform test failures

### ❌ i18n Violations
- Use English strings directly: `print("Hello")`
- Bypass message keys
- Hardcode locale in code
- Skip translations for new features

### ❌ WebUI Violations
- Hand-write routes/components (must be generated)
- Skip Monaco editor integration
- Ignore mobile responsiveness
- Hardcode search logic (must derive from specs)

---

## ✅ Best Practices (DO THESE)

### ✅ Architecture
- Add tool specs to JSON with UUID + search metadata
- Implement interfaces or extend base classes for all components
- Keep public methods ≤3 per class
- Keep functions ≤10 lines (refactor helpers if needed)
- Inject adapters via constructor (dependency inversion)
- Register every component in appropriate registry

### ✅ Execution
- Use command arrays: `["apt-get", "install", "-y", "git"]`
- Check `platforms: {linux: true}` before execute
- Mediate all I/O through adapters
- Validate inputs at adapter boundaries

### ✅ Security
- Reference secret providers (Keeper, env, keychain)
- Mark risks explicitly in tool specs
- Require confirmations for destructive/network ops
- Log all external operations

### ✅ Testing
- Write tests first (TDD where feasible)
- Achieve 100% coverage before merge
- Use golden files for generated artifacts
- Run cross-platform tests in CI

### ✅ i18n
- Use message keys: `messages.get("msg.tool.git.summary")`
- Provide fallback locale (English)
- Generate typed accessors for keys
- Test missing translation detection

### ✅ WebUI
- Generate all routes/components from specs
- Integrate Monaco with JSON schema validation
- Support mobile viewports (responsive design)
- Derive search from spec metadata

---

## Extensibility

### Adding New Tools (Plugin Workflow)

Instead of modifying core, create a new plugin:

1. **Create Plugin Directory Structure**
   ```bash
   mkdir -p plugins/tools/newtool/{src/installers,src/validators,tests}
   cd plugins/tools/newtool
   ```

2. **Create plugin.json Manifest**
   ```json
   {
     "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "id": "plugin.tools.newtool",
     "version": "1.0.0",
     "type": "tool",
     "name": "New Tool Plugin",
     "description": "Description of the tool",
     "author": "Your Name",
     "license": "MIT",
     "entry_point": "src/newtool_plugin.py:NewToolPlugin",
     "spec_file": "spec.json",
     "messages_file": "messages.json",
     "dependencies": {
       "core": ">=1.0.0"
     },
     "platforms": {"win": true, "mac": true, "linux": true},
     "registries": ["DevWorkflowRegistry"],
     "capabilities": ["install", "verify", "execute"],
     "tests": {
       "directory": "tests/",
       "coverage_required": 100
     }
   }
   ```

3. **Create spec.json** (tool specification)
4. **Create messages.json** (i18n keys)
5. **Implement Plugin Class** in `src/newtool_plugin.py`
6. **Implement Platform Installers** in `src/installers/`
7. **Implement Validators** in `src/validators/`
8. **Write Tests** in `tests/` (100% coverage)
9. **Test Plugin**: `codegen plugin test plugin.tools.newtool`
10. **Verify in CLI**: `codegen tool install newtool`
11. **Verify in WebUI**: Search for tool, view details, generate runbook

### Adding New Platforms (Workflow)
1. Extend `platforms` field in JSON schema:
   ```json
   {"win": bool, "mac": bool, "linux": bool, "freebsd": bool}
   ```
2. Update adapter interfaces for new OS
3. Add platform-specific command mappings in tool specs
4. Update test matrix in CI config
5. Regenerate all artifacts
6. Run cross-platform tests

### Adding New Capabilities (Workflow)
- **New Registries**: Add to appropriate aggregate (e.g., `MonitoringRegistry` for observability tools)
- **New Risk Types**: Extend `risks` schema (e.g., `requiresRoot: true`)
- **New Profile Keys**: Add to `overrides` schema (e.g., `preferredTerminal`)
- **New Search Fields**: Extend `search` metadata (e.g., `maturity: "stable"`)

Always: spec-driven, UUID-identified, search-indexed, tested, documented.

---

## Development Workflow for AI Agents

### 1. Read the Spec
- Understand tool/profile/registry/aggregate structure
- Check JSON schema for required fields
- Identify which registries are involved

### 2. Spec or Code?
- **Spec change**: Add/modify JSON records
- **Core logic change**: Modify generator or component implementations
- **Both**: Update spec first, then regenerate, then adjust core if needed

### 3. Maintain Constraints
- Dataclass-first components
- Lifecycle methods (initialise, execute, validate, describe, shutdown)
- ≤3 public methods per class
- ≤10 lines per function
- Interface/base class inheritance
- Adapter boundaries for I/O

### 4. Generate, Don't Write
- CLI/WebUI code is generated artifacts
- Don't hand-write routes, components, registries
- Modify generator templates, not outputs

### 5. Test Exhaustively
- Unit tests (isolated, mocked adapters)
- Integration tests (registries, search, profiles)
- Cross-platform tests (win/mac/linux)
- Coverage must be 100%

### 6. Update Message Keys
- All new UI text goes in JSON as message keys
- Provide translations for all supported locales
- Test missing key detection

### 7. Document with UUIDs
- Reference spec record UUIDs in code comments
- Link generated artifacts back to specs
- Maintain traceability

---

## Code Review Checklist

Before submitting code, verify:

- [ ] New specs have UUIDs (RFC 4122, valid, unique)
- [ ] New specs have complete search metadata (title/summary/keywords)
- [ ] Commands use arrays, not shell strings
- [ ] Core logic is pure (no I/O)
- [ ] Adapters handle I/O explicitly
- [ ] Platform checks present where needed
- [ ] Risk metadata for destructive/network ops
- [ ] Every class implements interface or extends base class
- [ ] ≤3 public methods per class (excluding constructors)
- [ ] ≤10 lines per function (strict)
- [ ] 100% test coverage maintained
- [ ] Message keys used (no hardcoded strings)
- [ ] Generated artifacts regenerated
- [ ] Cross-platform CI passes (win/mac/linux)
- [ ] WebUI search works for new components
- [ ] Monaco editor validates new JSON schemas
- [ ] Documentation updated (auto-generated or manual)

---

## Example: Adding a New Tool (curl)

### Step 1: Add Spec to JSON
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "id": "tool.dev.curl",
  "type": "tool",
  "search": {
    "title": "cURL",
    "summary": "Command-line tool for transferring data with URLs",
    "keywords": ["http", "download", "api", "rest", "web"],
    "tags": ["network", "cli", "essential"],
    "aliases": ["curl"],
    "domain": "tooling",
    "capabilities": ["http-client", "file-transfer", "api-testing"]
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "install": {
    "linux": {
      "apt": ["apt-get", "install", "-y", "curl"],
      "snap": ["snap", "install", "curl"]
    },
    "mac": {"brew": ["brew", "install", "curl"]},
    "win": {
      "choco": ["choco", "install", "curl", "-y"],
      "winget": ["winget", "install", "cURL.cURL"]
    }
  },
  "verify": {
    "linux": ["curl", "--version"],
    "mac": ["curl", "--version"],
    "win": ["curl", "--version"]
  },
  "help": {
    "linux": ["curl", "--help"],
    "mac": ["curl", "--help"],
    "win": ["curl", "--help"]
  },
  "oneLiners": [
    {
      "id": "get-request",
      "description": "msg.tool.curl.oneliner.get",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "GET", "{url}"]
    },
    {
      "id": "post-json",
      "description": "msg.tool.curl.oneliner.post",
      "platforms": {"win": true, "mac": true, "linux": true},
      "command": ["curl", "-X", "POST", "-H", "Content-Type: application/json", "-d", "{data}", "{url}"]
    }
  ],
  "options": [
    {"flag": "-X", "description": "msg.tool.curl.opt.method", "platforms": {...}},
    {"flag": "-H", "description": "msg.tool.curl.opt.header", "platforms": {...}},
    {"flag": "-d", "description": "msg.tool.curl.opt.data", "platforms": {...}}
  ],
  "dependencies": [],
  "risks": {
    "destructive": false,
    "network": true,
    "confirmation": "msg.tool.curl.risk.network"
  }
}
```

### Step 2: Add Message Keys
```json
{
  "messageKeys": {
    "msg.tool.curl.oneliner.get": {
      "en": "Perform HTTP GET request",
      "es": "Realizar solicitud HTTP GET"
    },
    "msg.tool.curl.oneliner.post": {
      "en": "Perform HTTP POST with JSON data",
      "es": "Realizar solicitud HTTP POST con datos JSON"
    },
    "msg.tool.curl.opt.method": {
      "en": "Specify request method",
      "es": "Especificar método de solicitud"
    },
    "msg.tool.curl.opt.header": {
      "en": "Add custom header",
      "es": "Agregar encabezado personalizado"
    },
    "msg.tool.curl.opt.data": {
      "en": "Send data in request body",
      "es": "Enviar datos en el cuerpo de la solicitud"
    },
    "msg.tool.curl.risk.network": {
      "en": "This operation will make network requests. Continue?",
      "es": "Esta operación realizará solicitudes de red. ¿Continuar?"
    }
  }
}
```

### Step 3: Assign to Registry
Ensure `tool.dev.curl` is included in `DevWorkflowRegistry` within `ToolingAggregate`.

In the spec structure:
```json
{
  "registries": {
    "DevWorkflowRegistry": {
      "tools": [
        "tool.dev.git",
        "tool.dev.curl",
        "tool.dev.docker",
        "..."
      ]
    }
  }
}
```

### Step 4: Regenerate All Artifacts
```bash
codegen generate --all
```

This produces:
- Updated CLI with `codegen tool install curl` command
- Updated WebUI with curl in tool catalog
- Updated search index (searches for "http", "api", "curl" now find this tool)
- Updated registries with curl entry
- Test fixtures for curl

### Step 5: Write Tests

#### Unit Test (Python example)
```python
import pytest
from codegen.core.registry import ToolsRegistry
from codegen.core.models import Tool

def test_curl_spec_valid():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool is not None
    assert tool.uuid == "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    assert tool.search.title == "cURL"
    assert "http" in tool.search.keywords
    assert tool.risks.network is True
    assert tool.risks.destructive is False

def test_curl_platforms():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    assert tool.platforms.linux is True
    assert tool.platforms.mac is True
    assert tool.platforms.win is True

def test_curl_install_commands():
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    # Linux
    assert tool.install.linux.apt == ["apt-get", "install", "-y", "curl"]
    assert tool.install.linux.snap == ["snap", "install", "curl"]
    
    # macOS
    assert tool.install.mac.brew == ["brew", "install", "curl"]
    
    # Windows
    assert tool.install.win.choco == ["choco", "install", "curl", "-y"]
    assert tool.install.win.winget == ["winget", "install", "cURL.cURL"]
```

#### Integration Test
```python
def test_curl_install_plan_linux():
    planner = InstallPlanner.from_spec("specs.json")
    plan = planner.create_install_plan(
        tool_id="tool.dev.curl",
        platform="linux",
        package_manager="apt"
    )
    
    assert len(plan.steps) == 1
    assert plan.steps[0].command == ["apt-get", "install", "-y", "curl"]
    assert plan.steps[0].requires_confirmation is True  # network risk

def test_curl_searchable():
    search_engine = SearchEngine.from_spec("specs.json")
    
    results = search_engine.search("http client")
    tool_ids = [r.id for r in results]
    
    assert "tool.dev.curl" in tool_ids
    
def test_curl_reachable_from_root():
    root = RootAggregate.from_spec("specs.json")
    
    tooling = root.get_child("tooling")
    dev_workflow = tooling.get_child("dev-workflow")
    curl = dev_workflow.get("tool.dev.curl")
    
    assert curl is not None
    assert curl.id == "tool.dev.curl"
```

#### Cross-Platform Test
```python
@pytest.mark.parametrize("platform", ["linux", "mac", "win"])
def test_curl_verify_command(platform):
    registry = ToolsRegistry.from_spec("specs.json")
    tool = registry.get("tool.dev.curl")
    
    verify_cmd = tool.verify.get_for_platform(platform)
    assert verify_cmd == ["curl", "--version"]
```

### Step 6: Verify in WebUI
1. Start dev server: `npm run dev` (in generated WebUI directory)
2. Navigate to `http://localhost:3000`
3. Search for "curl" → tool appears in results
4. Click tool → view details page showing:
   - UUID, ID, search metadata
   - Platform support
   - Install commands per platform/package manager
   - One-liners
   - Options
   - Risk warnings
5. Select "Generate Runbook" → add curl to plan → export

### Step 7: Verify in CLI
```bash
# Search
$ codegen search "http client"
Found 3 results:
1. tool.dev.curl - cURL (Command-line tool for transferring data with URLs)
2. tool.dev.httpie - HTTPie (Human-friendly HTTP client)
3. tool.dev.wget - Wget (Non-interactive network downloader)

# Describe
$ codegen describe tool.dev.curl
UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
ID: tool.dev.curl
Title: cURL
Summary: Command-line tool for transferring data with URLs
Platforms: linux, mac, win
Risks: network
Keywords: http, download, api, rest, web

Install Commands:
  Linux (apt): apt-get install -y curl
  macOS (brew): brew install curl
  Windows (choco): choco install curl -y

# Install
$ codegen tool install curl --platform=linux --package-manager=apt
[WARNING] This operation will make network requests. Continue? (y/N): y
[INFO] Installing curl via apt...
[INFO] Running: apt-get install -y curl
[SUCCESS] curl installed successfully

# Verify
$ codegen tool verify curl
[INFO] Verifying curl installation...
[INFO] Running: curl --version
curl 7.81.0 (x86_64-pc-linux-gnu)
[SUCCESS] curl is installed and working
```

---

## Example: CI/CD Pipeline Plugin Integration

This example demonstrates how multiple plugins work together to create a complete CI/CD environment.

### Scenario: Setting Up a Kubernetes CI/CD Pipeline

#### 1. Profile Definition
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "id": "profile.devops-engineer",
  "type": "profile",
  "search": {
    "title": "DevOps Engineer",
    "summary": "Complete CI/CD and container orchestration toolkit",
    "keywords": ["devops", "ci-cd", "kubernetes", "docker", "gitops"],
    "domain": "profiles"
  },
  "platforms": {"win": true, "mac": true, "linux": true},
  "overrides": {
    "preferredPackageManager": {
      "linux": "apt",
      "mac": "brew",
      "win": "choco"
    },
    "toolVersions": {
      "tool.container.docker": "24.x",
      "tool.container.kubectl": "1.28.x",
      "tool.cicd.argocd": "2.9.x",
      "tool.iac.terraform": "1.6.x"
    },
    "features": {
      "docker": true,
      "kubernetes": true,
      "gitops": true,
      "iac": true,
      "monitoring": true
    },
    "workspaceRoot": "~/devops",
    "containerRegistry": "ghcr.io"
  },
  "requiredTools": [
    "tool.dev.git",
    "tool.container.docker",
    "tool.container.kubectl",
    "tool.container.helm",
    "tool.cicd.argocd",
    "tool.iac.terraform",
    "tool.cicd.github-actions-runner",
    "tool.security.trivy",
    "tool.dev.jq",
    "tool.dev.yq"
  ]
}
```

#### 2. Runbook Generation
```bash
$ codegen runbook generate --profile=devops-engineer --platform=linux

[INFO] Generating runbook for profile: devops-engineer
[INFO] Target platform: linux
[INFO] Resolving dependencies...

Runbook: DevOps Engineer Setup
================================

Prerequisites:
- Sudo access
- Internet connection
- 8GB RAM minimum
- 50GB free disk space

Step 1: Package Manager Setup
------------------------------
[apt] Update package lists
$ sudo apt-get update

Step 2: Core Development Tools
-------------------------------
[git] Install Git version control
$ sudo apt-get install -y git
Verify: git --version

Step 3: Container Runtime
--------------------------
[docker] Install Docker Engine
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh
$ sudo usermod -aG docker $USER
Verify: docker --version
Post-install: Log out and back in for group changes

[docker-compose] Install Docker Compose V2
$ sudo apt-get install -y docker-compose-plugin
Verify: docker compose version

Step 4: Kubernetes Tools
-------------------------
[kubectl] Install Kubernetes CLI
$ curl -LO "https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
$ sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
Verify: kubectl version --client

[helm] Install Helm package manager
$ curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
Verify: helm version

[k3d] Install k3d for local clusters
$ wget -q -O - https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
Verify: k3d version

Step 5: GitOps & CD Tools
--------------------------
[argocd] Install ArgoCD CLI
$ curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
Verify: argocd version

Step 6: Infrastructure as Code
-------------------------------
[terraform] Install Terraform
$ wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
$ echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
$ sudo apt-get update && sudo apt-get install -y terraform
Verify: terraform version

Step 7: CI/CD Runners
----------------------
[github-actions-runner] Install GitHub Actions self-hosted runner
$ mkdir -p ~/actions-runner && cd ~/actions-runner
$ curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
$ tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
Note: Configure with: ./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN

Step 8: Security Tools
-----------------------
[trivy] Install Trivy vulnerability scanner
$ wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
$ echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
$ sudo apt-get update && sudo apt-get install -y trivy
Verify: trivy version

Step 9: Utilities
------------------
[jq] Install JSON processor
$ sudo apt-get install -y jq
Verify: jq --version

[yq] Install YAML processor
$ wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
$ chmod +x /usr/local/bin/yq
Verify: yq --version

Step 10: Verification
----------------------
Running full verification suite...
✓ git installed (version 2.34.1)
✓ docker installed (version 24.0.7)
✓ docker-compose installed (version 2.23.0)
✓ kubectl installed (version 1.28.0)
✓ helm installed (version 3.13.0)
✓ k3d installed (version 5.6.0)
✓ argocd installed (version 2.9.0)
✓ terraform installed (version 1.6.4)
✓ trivy installed (version 0.47.0)
✓ jq installed (version 1.6)
✓ yq installed (version 4.35.2)

All tools successfully installed!

Next Steps:
-----------
1. Create a local Kubernetes cluster:
   $ k3d cluster create dev-cluster

2. Deploy ArgoCD to the cluster:
   $ kubectl create namespace argocd
   $ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

3. Configure GitHub Actions runner:
   $ cd ~/actions-runner
   $ ./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN
   $ ./run.sh

4. Initialize Terraform workspace:
   $ cd ~/devops
   $ terraform init

Export runbook? (markdown/json/shell): 
```

#### 3. Template Usage: GitHub Actions + Docker + Kubernetes
```bash
$ codegen template generate github-actions-docker-k8s --output=./myapp

[INFO] Generating template: github-actions-docker-k8s
[INFO] Output directory: ./myapp
[INFO] Using profile: devops-engineer

Generated files:
./myapp/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Build and test
│       ├── cd.yml                 # Deploy to k8s
│       └── security-scan.yml      # Trivy scanning
├── k8s/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   ├── overlays/
│   │   ├── dev/
│   │   │   └── kustomization.yaml
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   └── prod/
│   │       └── kustomization.yaml
│   └── argocd/
│       └── application.yaml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── skaffold.yaml
└── README.md

[SUCCESS] Template generated successfully!
```

#### 4. Generated GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
# Auto-generated by codegen template: github-actions-docker-k8s
# Profile: devops-engineer
# Plugins: github-actions, docker, kubectl, trivy

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
  
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run tests
        run: |
          docker compose -f docker-compose.test.yml up --abort-on-container-exit
          docker compose -f docker-compose.test.yml down
```

#### 5. Generated CD Workflow (.github/workflows/cd.yml)
```yaml
# Auto-generated by codegen template: github-actions-docker-k8s
# Profile: devops-engineer
# Plugins: github-actions, docker, kubectl, argocd

name: CD Pipeline

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Update Kubernetes manifests
        run: |
          cd k8s/overlays/prod
          kustomize edit set image ghcr.io/${{ github.repository }}:${{ github.sha }}
      
      - name: Commit manifest changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add k8s/
          git commit -m "Update image to ${{ github.sha }}" || echo "No changes"
          git push
      
      - name: Sync ArgoCD application
        run: |
          argocd app sync myapp --grpc-web
        env:
          ARGOCD_SERVER: ${{ secrets.ARGOCD_SERVER }}
          ARGOCD_AUTH_TOKEN: ${{ secrets.ARGOCD_TOKEN }}
```

#### 6. CLI Workflow Example
```bash
# Install all tools for DevOps profile
$ codegen profile apply devops-engineer
[INFO] Applying profile: devops-engineer
[INFO] Installing 11 required tools...
[INFO] This will install: git, docker, kubectl, helm, k3d, argocd, terraform, github-actions-runner, trivy, jq, yq
Continue? (y/N): y

[1/11] Installing git...
[2/11] Installing docker...
[3/11] Installing kubectl...
# ... (progress continues)

[SUCCESS] All tools installed!

# Verify all tools
$ codegen profile verify devops-engineer
[INFO] Verifying profile: devops-engineer
✓ git (version 2.34.1)
✓ docker (version 24.0.7)
✓ kubectl (version 1.28.0)
# ... (all tools verified)

[SUCCESS] All tools verified!

# Create a new project with CI/CD pipeline
$ codegen project create myapp \
  --template=github-actions-docker-k8s \
  --profile=devops-engineer \
  --registry=ghcr.io/myorg/myapp

[INFO] Creating project: myapp
[INFO] Template: github-actions-docker-k8s
[INFO] Profile: devops-engineer
[INFO] Container registry: ghcr.io/myorg/myapp

Generated project structure:
✓ GitHub Actions workflows (CI/CD)
✓ Kubernetes manifests (base + overlays)
✓ ArgoCD application
✓ Dockerfile + docker-compose
✓ Skaffold configuration

[SUCCESS] Project created at ./myapp

Next steps:
1. cd myapp
2. git init && git add . && git commit -m "Initial commit"
3. git remote add origin https://github.com/myorg/myapp.git
4. git push -u origin main
5. Configure ArgoCD to watch this repository
6. Push code to trigger CI/CD pipeline

# Generate runbook for team onboarding
$ codegen runbook generate \
  --profile=devops-engineer \
  --platform=linux \
  --format=markdown \
  --output=ONBOARDING.md

[SUCCESS] Runbook saved to ONBOARDING.md
```

This example demonstrates:
- **Multiple plugins working together** (GitHub Actions, Docker, kubectl, ArgoCD, Terraform, Trivy)
- **Profile-driven configuration** (DevOps Engineer profile)
- **Template generation** (CI/CD pipeline with security scanning)
- **Runbook automation** (Repeatable environment setup)
- **Cross-tool integration** (All tools configured to work as a cohesive system)

---

## Recommended Additional Tools

Beyond the initial list, strongly consider adding:

### CI/CD & DevOps Essentials
- **GitHub Actions**: CLI and runner tools
- **GitLab CI**: Runner and pipeline tools
- **Jenkins**: Server and CLI
- **CircleCI**: CLI and local executor
- **Azure DevOps**: CLI and pipelines
- **Travis CI**: CLI
- **ArgoCD**: GitOps CD for Kubernetes
- **Flux**: GitOps toolkit
- **Spinnaker**: Multi-cloud CD platform
- **Tekton**: Kubernetes-native CI/CD

### Container Ecosystem (Comprehensive)
- **Docker Variants**:
  - Docker Desktop (Win/Mac)
  - Docker Engine (Linux)
  - Docker CE/EE
  - Colima (macOS Docker alternative)
  - Rancher Desktop
  - OrbStack (macOS)
- **Container Build Tools**:
  - buildx (Docker multi-platform builds)
  - buildkit (improved build backend)
  - kaniko (in-cluster container builds)
  - buildah (OCI container builder)
  - img (standalone daemon-less builds)
- **Container Runtimes**:
  - containerd
  - cri-o
  - podman
  - lxc/lxd
- **Container Security**:
  - trivy (vulnerability scanner)
  - clair (static analysis)
  - anchore (deep image inspection)
  - snyk (security scanning)
  - docker-bench-security (CIS benchmark)
  - hadolint (Dockerfile linter)
- **Container Management**:
  - portainer (web UI)
  - lazydocker (terminal UI)
  - ctop (container top)
  - dive (image layer analyzer)
  - dry (interactive CLI)

### Kubernetes & Orchestration
- **Kubernetes Variants**:
  - kubectl (CLI)
  - k3s (lightweight k8s)
  - k3d (k3s in docker)
  - minikube (local k8s)
  - kind (k8s in docker)
  - microk8s (lightweight k8s)
  - rancher (k8s management)
  - openshift (enterprise k8s)
- **Kubernetes Tools**:
  - helm (package manager)
  - helmfile (declarative helm)
  - kustomize (config management)
  - skaffold (dev workflow)
  - tilt (local dev)
  - devspace (dev environment)
  - telepresence (local-to-cluster bridge)
  - stern (multi-pod log tailing)
  - k9s (terminal UI)
  - kubectx/kubens (context/namespace switcher)
  - krew (kubectl plugin manager)
- **Service Mesh**:
  - istio
  - linkerd
  - consul
  - envoy

### Infrastructure as Code
- **Provisioning**:
  - terraform
  - terragrunt (terraform wrapper)
  - pulumi (multi-language IaC)
  - crossplane (k8s-native IaC)
  - opentofu (terraform fork)
- **Configuration Management**:
  - ansible
  - chef
  - puppet
  - saltstack
- **Cloud-Specific**:
  - AWS CloudFormation
  - Azure ARM Templates / Bicep
  - Google Deployment Manager
  - AWS CDK
  - Azure CDK

### Container Registry Tools
- **Registry CLIs**:
  - docker login/push/pull
  - crane (go-containerregistry CLI)
  - skopeo (image operations)
  - regctl (registry client)
- **Registry Servers**:
  - Harbor
  - Quay
  - JFrog Artifactory
  - Nexus Repository
  - GitLab Container Registry
  - GitHub Container Registry (ghcr)

### Monitoring & Observability (for CI/CD)
- **Metrics**:
  - prometheus
  - grafana
  - datadog-agent
  - newrelic-agent
- **Logging**:
  - fluentd
  - logstash
  - vector
  - promtail
- **Tracing**:
  - jaeger
  - zipkin
  - tempo
- **APM**:
  - elastic-apm
  - opentelemetry

### Shell/Terminal Tools
- **bash**, **zsh**, **fish**: Shell environments
- **powershell**: Windows automation baseline
- **windows-terminal**: Modern Windows terminal
- **tmux**, **screen**: Terminal multiplexers
- **oh-my-zsh**, **oh-my-posh**: Shell frameworks

### Archive/Compression Tools
- **tar**: Archive utility
- **zip**, **unzip**: ZIP compression
- **7zip**: Multi-format archiver
- **gzip**, **bzip2**: Compression utilities

### Text Processing Tools
- **jq**: JSON processor
- **yq**: YAML processor
- **grep**, **sed**, **awk**: Text manipulation (Linux/macOS)
- **ripgrep** (rg): Fast grep alternative
- **fzf**: Fuzzy finder
- **bat**: Better cat with syntax highlighting
- **fd**: Better find alternative

### Security/Crypto Tools
- **openssl**: TLS/crypto toolkit
- **gpg**: GNU Privacy Guard
- **ssh-keygen**: SSH key generation
- **age**: Modern encryption tool
- **vault**: HashiCorp Vault (secrets management)
- **sops**: Secrets operations
- **sealed-secrets**: Kubernetes secrets

### Version Managers
- **nvm**, **fnm**: Node version managers
- **pyenv**: Python version manager
- **rbenv**: Ruby version manager
- **rustup**: Rust toolchain manager
- **sdkman**: JVM version manager
- **asdf**: Universal version manager
- **tfenv**: Terraform version manager
- **kenv**: kubectl version manager

### Cloud CLI Tools
- **aws-cli**: AWS command line
- **gcloud**: Google Cloud CLI
- **azure-cli**: Azure command line
- **doctl**: DigitalOcean CLI
- **linode-cli**: Linode CLI
- **ibmcloud**: IBM Cloud CLI

### Tunneling/Networking Tools
- **ngrok**: Expose localhost to internet
- **cloudflared**: Cloudflare tunnel
- **localtunnel**: Expose localhost
- **tailscale**: VPN mesh network
- **wireguard**: Modern VPN
- **mkcert**: Local HTTPS certificates
- **inlets**: Tunnel services to any network

### Database CLI Clients
- **psql**: PostgreSQL client
- **mysql**: MySQL client
- **sqlite3**: SQLite CLI
- **redis-cli**: Redis client
- **mongosh**: MongoDB shell
- **influx**: InfluxDB CLI
- **cockroach**: CockroachDB CLI

### Monitoring/System Tools
- **htop**, **btop**: Interactive process viewers
- **glances**: System monitoring
- **ncdu**: Disk usage analyzer
- **dstat**, **iostat**: System statistics
- **nethogs**: Network bandwidth per process
- **iftop**: Network bandwidth monitoring

### Development Utilities
- **gh**: GitHub CLI
- **glab**: GitLab CLI
- **watchman**: File watching service
- **entr**: Run commands when files change
- **direnv**: Environment switcher
- **asdf**: Universal version manager
- **pre-commit**: Git hook framework
- **commitizen**: Commit message formatter
- **semantic-release**: Automated versioning

### Testing & Quality Tools
- **sonarqube**: Code quality
- **codecov**: Coverage reporting
- **eslint**, **prettier**: JS linting/formatting
- **pylint**, **black**: Python linting/formatting
- **rustfmt**, **clippy**: Rust formatting/linting
- **shellcheck**: Shell script linting

All follow the same UUID + spec + registry + plugin pattern.

---

## Operational Principles Summary

### For AI Agents: The Ten Commandments

1. **Single Source of Truth**: All behavior derives from specs (plugin spec.json + manifest)
2. **Dataclass-First**: Every component is a structured, typed entity
3. **Lifecycle-Driven**: `initialise()` → `execute()` → `shutdown()`
4. **Interface/Base Required**: No naked concrete classes
5. **Method Limits**: ≤3 public methods, ≤10 lines per function
6. **Registry-Registered**: Everything discoverable via aggregates
7. **UUID-Identified**: RFC 4122 for every record
8. **Search-Indexed**: Complete metadata for discoverability
9. **i18n-Ready**: Message keys, never hardcoded strings
10. **100% Coverage**: No untested code, ever
11. **Plugin-Based**: One plugin per tool, clean hierarchy, full tests

### When In Doubt
1. Check the plugin spec first (spec.json + plugin.json)
2. Is it a spec change or plugin implementation change?
3. Should this be a new plugin or modification to existing?
4. Will this be testable?
5. Does this respect the adapter boundary?
6. Is this discoverable via registries?
7. Are message keys used?
8. Is the method/line limit respected?
9. Does the component implement an interface/base class?
10. Does the plugin have 100% test coverage?

### Quality Gates (Non-Negotiable)
- [ ] 100% test coverage (lines, branches, functions, statements)
- [ ] All classes implement interface or extend base class
- [ ] ≤3 public methods per class
- [ ] ≤10 lines per function
- [ ] No hardcoded user-facing strings
- [ ] All components registered in appropriate registry
- [ ] All UUIDs valid and unique
- [ ] All search metadata complete
- [ ] Cross-platform tests pass (win/mac/linux)
- [ ] Generated artifacts are up-to-date
- [ ] Each plugin has proper directory structure
- [ ] Each plugin has complete plugin.json manifest
- [ ] Each plugin has 100% test coverage
- [ ] Each plugin has README.md documentation

---

## Glossary

**Adapter**: Boundary layer that handles I/O (filesystem, network, shell execution). Core logic never touches adapters directly; adapters are injected.

**Aggregate**: Hierarchical container grouping registries and sub-aggregates. Supports drill-down navigation (`list_children()`, `get_child()`).

**Component**: Dataclass-first entity with lifecycle methods. Must implement interface or extend base class.

**Core**: Pure, deterministic business logic. No I/O, no side effects. Testable in isolation. Minimal implementation; most capabilities come from plugins.

**Dataclass-First**: Components defined as structured data classes with explicit fields, validation, and lifecycle methods.

**Deterministic**: Same inputs always produce same outputs. Critical for reproducibility and testing.

**Drill-Down Navigation**: Traversing the aggregate tree from root to leaf, discovering capabilities along the way.

**Lifecycle Methods**: Standard contract methods: `initialise()`, `execute()`, `validate()`, `describe()`, `shutdown()`.

**Lockfile**: JSON artifact with resolved, pinned versions of tools/dependencies. Ensures reproducibility.

**Message Key**: i18n/L10n identifier for user-facing text. Format: `msg.domain.component.field`.

**One-Liner**: Common command pattern for a tool, parameterized for reuse (e.g., `git clone {url}`).

**Plugin**: Self-contained, isolated extension that provides capabilities (tools, languages, templates, profiles). One plugin per tool. Each plugin has its own directory with manifest, spec, messages, implementation, and tests.

**Plugin Manifest**: `plugin.json` file describing plugin metadata, dependencies, entry point, and capabilities.

**Profile**: User/project-specific overrides for tool versions, package managers, workspace locations, feature flags.

**Registry**: Read-only index mapping stable IDs/UUIDs to components. Immutable after construction.

**Runbook**: Generated installation/setup plan for a specific platform + profile + tool set. Exportable as Markdown/JSON/shell script.

**Search Metadata**: Structured data for discoverability: title, summary, keywords, tags, aliases, capabilities.

**Spec Record**: JSON entity with UUID, ID, search metadata, and domain-specific fields (tool, profile, snippet, etc.). Each plugin has its own spec.json.

**Tool Plugin**: Plugin that provides a single tool with install/verify/help commands, one-liners, options, platform support, risk metadata. One directory per tool.

**UUID**: RFC 4122 universally unique identifier. Every discoverable entity has one.

---

## Final Notes

This platform is **not** a collection of scripts. It is a **spec-driven, plugin-based system** for:

- Generating cross-platform tooling orchestrators
- Discovering and searching tools via registries/aggregates
- Creating reproducible development environments
- Building CLI and WebUI experiences from plugins
- **Extending capabilities through isolated, testable plugins**

**Everything is:**
- Searchable (via metadata)
- Discoverable (via registries/aggregates)
- Deterministic (same inputs → same outputs)
- Testable (100% coverage, always)
- Extensible (create plugin, write tests, done)
- Spec-Driven (modify plugin specs, not core)
- **Plugin-Based (one plugin per tool, clean hierarchy)**

**Core is minimal. Plugins provide capabilities.**

**When working on this project:**
- Decide: does this belong in core or a plugin?
- If it's a tool, create a new plugin
- Add plugin specs (plugin.json + spec.json + messages.json)
- Implement plugin class and platform installers
- Write tests (100% coverage)
- Register with appropriate registry
- Make it discoverable
- Document in plugin README.md

**Plugin Directory Structure:**
```
plugins/
├── tools/              # One directory per tool
│   ├── git/
│   ├── docker/
│   └── curl/
├── languages/          # Language generators
├── templates/          # Project templates
└── profiles/           # User profiles
```

**This is the way.**
