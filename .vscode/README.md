# .vscode workspace settings

Workspace-level VS Code settings used across the monorepo:

- **WSL Codex integration**: `chatgpt.runCodexInWindowsSubsystemForLinux` is enabled so the Codex runner uses the WSL environment. This keeps tooling consistent with the Linux-based project scripts.
- Add any additional shared settings here (formatting overrides, default linters, or recommended extensions) so collaborators inherit the same editor behavior.

> These settings are intentionally lightweight; repository-level formatter and lint rules still live in their respective packages.
