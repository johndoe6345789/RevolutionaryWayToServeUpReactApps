#!/usr/bin/env python3
"""
Helper utilities that download, configure, and run a GitHub Actions self-hosted runner.
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

API_LATEST_RELEASE = "https://api.github.com/repos/actions/runner/releases/latest"
USER_AGENT = "rwtra-actions-runner/1.0"
DOWNLOAD_TIMEOUT_S = 10 * 60


def default_cache_root() -> Path:
    env = os.environ
    if sys.platform.startswith("win"):
        base = env.get("XDG_CACHE_HOME") or env.get("LOCALAPPDATA") or env.get("APPDATA")
        if not base:
            base = Path.home() / "AppData" / "Local"
    else:
        base = env.get("XDG_CACHE_HOME")
        if not base:
            base = Path.home() / ".cache"
    return Path(base) / "rwtra-actions-runner"


def fetch_latest_release() -> Tuple[str, List[Dict[str, Any]]]:
    request = urllib.request.Request(API_LATEST_RELEASE, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_S) as response:
        if response.status != 200:
            raise RuntimeError(f"failed to fetch runner metadata ({response.status})")
        data = json.load(response)
    tag = data.get("tag_name")
    assets = data.get("assets", [])
    if not isinstance(assets, list) or not tag:
        raise RuntimeError("release metadata missing expected fields")
    return tag, assets


def resolve_platform(
    os_override: Optional[str], arch_override: Optional[str]
) -> Tuple[str, str]:
    if os_override:
        os_label = os_override
    else:
        system = platform.system().lower()
        if system.startswith("win"):
            os_label = "win"
        elif system.startswith("darwin"):
            os_label = "osx"
        elif system.startswith("linux"):
            os_label = "linux"
        else:
            raise RuntimeError(f"unsupported operating system: {system}")
    if arch_override:
        arch_label = arch_override
    else:
        machine = platform.machine().lower()
        if machine in {"amd64", "x86_64"}:
            arch_label = "x64"
        elif machine in {"arm64", "aarch64"}:
            arch_label = "arm64"
        elif machine in {"x86", "i386", "i686"}:
            arch_label = "x86"
        else:
            arch_label = machine
    return os_label, arch_label


def choose_asset(assets: Iterable[Dict[str, Any]], os_label: str, arch_label: str) -> Dict[str, Any]:
    prefix = f"actions-runner-{os_label}-{arch_label}"
    for asset in assets:
        name = asset.get("name", "")
        if name.startswith(prefix) and name.endswith(".tar.gz"):
            return asset
    raise RuntimeError(f"no runner asset found for platform {os_label}/{arch_label}")


def download_asset(url: str, dest: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_S) as response, open(dest, "wb") as out_file:
        shutil.copyfileobj(response, out_file)


def extract_archive(archive: Path, destination: Path) -> Path:
    """Extract the release archive and return the runner root folder."""
    destination.mkdir(parents=True, exist_ok=True)
    if tarfile.is_tarfile(archive):
        with tarfile.open(archive) as tar:
            tar.extractall(destination)
    else:
        raise RuntimeError(f"unsupported archive format: {archive.name}")
    for child in destination.iterdir():
        if child.is_dir():
            candidate = child
            if (candidate / "config.sh").exists() or (candidate / "config.cmd").exists():
                return candidate
    return destination


def ensure_runner_downloaded(
    cache_dir: Path,
    runner_dir: Path,
    os_label: str,
    arch_label: str,
    force: bool,
) -> None:
    tag, assets = fetch_latest_release()
    asset = choose_asset(assets, os_label, arch_label)
    release_dir = cache_dir / tag
    artifact_path = release_dir / asset["name"]
    release_dir.mkdir(parents=True, exist_ok=True)
    should_install = force or not runner_dir.exists()
    if not should_install:
        return
    needs_download = not artifact_path.exists() or force
    download_url = asset.get("browser_download_url")
    if not download_url:
        raise RuntimeError("runner asset missing download URL")
    if needs_download:
        download_asset(download_url, artifact_path)
    with tempfile.TemporaryDirectory() as temp:
        runner_root = extract_archive(artifact_path, Path(temp))
        if runner_dir.exists():
            shutil.rmtree(runner_dir)
        shutil.copytree(runner_root, runner_dir)


def find_script(runner_dir: Path, base_name: str) -> Path:
    candidates = [runner_dir / f"{base_name}.sh", runner_dir / f"{base_name}.cmd"]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"{base_name} script not found in {runner_dir}")


def configure_runner(
    runner_dir: Path,
    url: str,
    token: str,
    name: Optional[str],
    labels: Optional[str],
    work_dir: Optional[Path],
    runner_group: Optional[str],
    replace: bool,
) -> None:
    script = find_script(runner_dir, "config")
    args = [str(script), "--unattended"]
    if name:
        args.extend(["--name", name])
    if labels:
        args.extend(["--labels", labels])
    if runner_group:
        args.extend(["--runnergroup", runner_group])
    resolved_work_dir = work_dir or (runner_dir / "_work")
    args.extend(["--work", str(resolved_work_dir)])
    args.extend(["--url", url, "--token", token])
    if replace:
        args.append("--replace")
    subprocess.run(args, cwd=runner_dir, check=True)


def remove_runner(runner_dir: Path, url: str, token: str) -> None:
    script = find_script(runner_dir, "config")
    args = [str(script)]
    args.extend(["remove", "--unattended"])
    args.extend(["--url", url, "--token", token])
    subprocess.run(args, cwd=runner_dir, check=True)


def start_runner(runner_dir: Path, once: bool, env_vars: Iterable[str]) -> None:
    script = find_script(runner_dir, "run")
    command = [str(script)]
    if once:
        command.append("--once")
    env = os.environ.copy()
    for env_var in env_vars:
        if "=" not in env_var:
            raise RuntimeError(f"invalid environment variable assignment: {env_var}")
        key, value = env_var.split("=", 1)
        env[key] = value
    subprocess.run(command, cwd=runner_dir, env=env, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Download and run a GitHub Actions self-hosted runner.")
    parser.add_argument(
        "--runner-dir",
        type=Path,
        default=Path("actions-runner"),
        help="Directory where the runner binaries are installed.",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path(os.environ.get("RUNNER_CACHE_DIR") or default_cache_root()),
        help="Directory used to cache downloaded releases.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    setup_parser = subparsers.add_parser("setup", help="Download and configure the runner.")
    setup_parser.add_argument("--url", required=True, help="Repository or organization URL (https://github.com/org/repo).")
    setup_parser.add_argument(
        "--token",
        help="Registration token (can also come from GITHUB_RUNNER_TOKEN or RUNNER_TOKEN).",
        default=os.environ.get("GITHUB_RUNNER_TOKEN") or os.environ.get("RUNNER_TOKEN"),
    )
    setup_parser.add_argument("--os-label", help="Override the OS label used to pick the release.")
    setup_parser.add_argument("--arch-label", help="Override the architecture label used to pick the release.")
    setup_parser.add_argument("--name", help="Runner name shown in GitHub.")
    setup_parser.add_argument("--labels", help="Comma-separated labels applied to the runner.")
    setup_parser.add_argument("--work-dir", type=Path, help="Custom _work directory for the runner.")
    setup_parser.add_argument("--runner-group", help="Runner group the runner should join.")
    setup_parser.add_argument("--replace", action="store_true", help="Re-register if a runner with the same name already exists.")
    setup_parser.add_argument("--force", action="store_true", help="Redownload the runner even if cached.")

    start_parser = subparsers.add_parser("start", help="Run the configured runner.")
    start_parser.add_argument("--once", action="store_true", help="Exit after a single job run.")
    start_parser.add_argument("--env", action="append", default=[], help="Additional environment vars (KEY=VALUE).")

    remove_parser = subparsers.add_parser("remove", help="Unregister the runner.")
    remove_parser.add_argument("--url", required=True, help="Repository or organization URL.")
    remove_parser.add_argument(
        "--token",
        help="Unregistration token (can also be supplied through env).",
        default=os.environ.get("GITHUB_RUNNER_TOKEN") or os.environ.get("RUNNER_TOKEN"),
    )

    args = parser.parse_args()
    runner_dir = args.runner_dir
    cache_dir = args.cache_dir
    if args.command == "setup":
        if not args.token:
            parser.error("a runner token must be supplied via --token or the GITHUB_RUNNER_TOKEN/RUNNER_TOKEN env var")
        os_label, arch_label = resolve_platform(args.os_label, args.arch_label)
        ensure_runner_downloaded(cache_dir, runner_dir, os_label, arch_label, args.force)
        configure_runner(
            runner_dir,
            args.url,
            args.token,
            args.name,
            args.labels,
            args.work_dir,
            args.runner_group,
            args.replace,
        )
    elif args.command == "start":
        if not runner_dir.exists():
            parser.error("runner directory does not exist; run the setup command first")
        start_runner(runner_dir, args.once, args.env)
    elif args.command == "remove":
        if not args.token:
            parser.error("a runner token must be supplied via --token or the GITHUB_RUNNER_TOKEN/RUNNER_TOKEN env var")
        if not runner_dir.exists():
            parser.error("runner directory does not exist")
        remove_runner(runner_dir, args.url, args.token)


if __name__ == "__main__":
    main()
