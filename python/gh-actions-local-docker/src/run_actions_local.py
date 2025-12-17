#!/usr/bin/env python3
"""Run GitHub Actions workflows locally via Docker using nektos/act.

Design goals:
- Run from any directory, targeting a repo root explicitly.
- Do not modify the repo except what the workflow itself does.
- Works on Linux/macOS/Windows (Docker Desktop) when Docker is running.
- Uses a Docker container to run "act".
- Executes jobs with the host Docker engine.
"""

from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

DEFAULT_ACT_IMAGE = "nektos/act:latest"
DEFAULT_CONTAINER_WORKDIR = "/repo"


@dataclass(frozen=True)
class ActRunSpec:
    repo_root: Path
    act_image: str
    workflow: str | None
    event: str
    job: str | None
    platform: list[str]
    secrets_file: Path | None
    env_file: Path | None
    bind_workdir: str
    reuse: bool
    privileged: bool
    verbose: bool
    dry_run: bool


def _abs_path(path: Path) -> Path:
    return path.expanduser().resolve()


def _repo_root(path: str) -> Path:
    root = _abs_path(Path(path))
    if not (root / ".github" / "workflows").exists():
        raise SystemExit(f"Repo root must contain .github/workflows: {root}")
    return root


def _has_docker() -> bool:
    return (
        subprocess.call(
            ["docker", "version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        == 0
    )


def _require_docker() -> None:
    if not _has_docker():
        raise SystemExit("Docker must be on PATH and running.")


def _sock_mount_args() -> list[str]:
    sock = Path("/var/run/docker.sock")
    if sock.exists():
        return ["-v", f"{sock}:{sock}"]
    return []


def _bind_mount_args(repo_root: Path, container_path: str) -> list[str]:
    host = str(repo_root)
    mount = f"{host}:{container_path}"
    return ["-v", mount, "-w", container_path]


def _file_arg(flag: str, path: Path | None) -> list[str]:
    if not path:
        return []
    return [flag, str(_abs_path(path))]


def _platform_args(items: Sequence[str]) -> list[str]:
    args: list[str] = []
    for item in items:
        args.extend(["-P", item])
    return args


def _workflow_args(path: str | None) -> list[str]:
    if not path:
        return []
    return ["-W", path]


def _job_args(job: str | None) -> list[str]:
    if not job:
        return []
    return ["-j", job]


def _event_args(event: str) -> list[str]:
    return [event]


def _reuse_args(reuse: bool) -> list[str]:
    return ["--reuse"] if reuse else []


def _verbose_args(verbose: bool) -> list[str]:
    return ["-v"] if verbose else []


def _privileged_args(privileged: bool) -> list[str]:
    return ["--privileged"] if privileged else []


def build_docker_command(spec: ActRunSpec) -> list[str]:
    cmd: list[str] = ["docker", "run", "--rm", "-t"]
    if sys.stdin.isatty():
        cmd.append("-i")
    cmd.extend(_privileged_args(spec.privileged))
    cmd.extend(_sock_mount_args())
    cmd.extend(_bind_mount_args(spec.repo_root, spec.bind_workdir))
    cmd.append(spec.act_image)
    cmd.extend(_workflow_args(spec.workflow))
    cmd.extend(_job_args(spec.job))
    cmd.extend(_platform_args(spec.platform))
    cmd.extend(_file_arg("--secret-file", spec.secrets_file))
    cmd.extend(_file_arg("--env-file", spec.env_file))
    cmd.extend(_reuse_args(spec.reuse))
    cmd.extend(_verbose_args(spec.verbose))
    cmd.extend(_event_args(spec.event))
    return cmd


def _print_command(cmd: Sequence[str]) -> None:
    printable = " ".join(shlex.quote(part) for part in cmd)
    print(printable)


def _run(cmd: Sequence[str]) -> int:
    return subprocess.call(list(cmd))


def _maybe_print_and_exit(spec: ActRunSpec, cmd: Sequence[str]) -> None:
    if spec.dry_run:
        _print_command(cmd)
        raise SystemExit(0)


def _parse_platform(values: list[str] | None) -> list[str]:
    if not values:
        return []
    out: list[str] = []
    for v in values:
        out.extend([p.strip() for p in v.split(",") if p.strip()])
    return out


def _default_platforms() -> list[str]:
    # Reasonable default: map "ubuntu-latest" to a modern act image.
    return ["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"]


def _platforms_or_default(items: list[str]) -> list[str]:
    return items if items else _default_platforms()


def parse_args(argv: Sequence[str] | None = None) -> ActRunSpec:
    p = argparse.ArgumentParser(
        description=(
            "Run GitHub Actions workflows locally (repo-root) using "
            "Docker + act."
        )
    )
    p.add_argument(
        "--repo-root",
        required=True,
        help="Path to the repository root (must contain .github/workflows).",
    )
    p.add_argument(
        "--workflow",
        help=(
            "Optional workflow path or directory passed to act (-W). "
            "Example: .github/workflows/ci.yml"
        ),
    )
    p.add_argument(
        "--event",
        default="push",
        help="GitHub event to simulate (default: push).",
    )
    p.add_argument("--job", help="Optional job id/name to run (-j).")
    p.add_argument(
        "--platform",
        action="append",
        help=(
            "Platform mapping(s) (-P). "
            "Example: --platform ubuntu-latest="
            "ghcr.io/catthehacker/ubuntu:act-latest"
        ),
    )
    p.add_argument(
        "--secrets-file",
        type=Path,
        help="Path to act secrets file.",
    )
    p.add_argument(
        "--env-file",
        type=Path,
        help="Path to act env file.",
    )
    p.add_argument(
        "--act-image",
        default=DEFAULT_ACT_IMAGE,
        help=(
            "Act Docker image to run. Defaults to "
            f"{DEFAULT_ACT_IMAGE}."
        ),
    )
    p.add_argument(
        "--bind-workdir",
        default=DEFAULT_CONTAINER_WORKDIR,
        help=(
            "Container path to mount the repo at "
            f"(default: {DEFAULT_CONTAINER_WORKDIR})."
        ),
    )
    p.add_argument(
        "--reuse",
        action="store_true",
        help="Reuse containers between runs (act --reuse).",
    )
    p.add_argument(
        "--privileged",
        action="store_true",
        help=(
            "Run act container as privileged (sometimes needed for "
            "Docker-in-Docker edge cases)."
        ),
    )
    p.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output (act -v).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the docker command and exit without executing.",
    )
    a = p.parse_args(argv)

    repo_root = _repo_root(a.repo_root)
    platforms = _platforms_or_default(_parse_platform(a.platform))
    workflow = a.workflow
    if workflow:
        wf = Path(workflow)
        if not wf.is_absolute():
            workflow = str((repo_root / wf).resolve())
    return ActRunSpec(
        repo_root=repo_root,
        act_image=a.act_image,
        workflow=workflow,
        event=a.event,
        job=a.job,
        platform=platforms,
        secrets_file=a.secrets_file,
        env_file=a.env_file,
        bind_workdir=a.bind_workdir,
        reuse=bool(a.reuse),
        privileged=bool(a.privileged),
        verbose=bool(a.verbose),
        dry_run=bool(a.dry_run),
    )


def main(argv: Sequence[str] | None = None) -> int:
    spec = parse_args(argv)
    _require_docker()
    cmd = build_docker_command(spec)
    _maybe_print_and_exit(spec, cmd)
    return _run(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
