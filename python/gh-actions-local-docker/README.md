# GitHub Actions Local Runner (Docker + act)

This project runs your repository's GitHub Actions workflows locally using Docker via the `nektos/act` image.

## Prerequisites

- Docker installed and running.

## Usage

Run all workflows for `push`:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --event push
```

Run a specific workflow file:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --workflow .github/workflows/ci.yml
```

Run a specific job:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --job build
```

Provide secrets/env files (act format):

```bash
python -m src.run_actions_local --repo-root /path/to/repo --secrets-file ./secrets.txt --env-file ./env.txt
```

Print the docker command only:

```bash
python -m src.run_actions_local --repo-root /path/to/repo --dry-run
```

## Notes

- The repo is bind-mounted into the act container at `/repo` (override with `--bind-workdir`).
- The act container uses the host Docker engine (via `/var/run/docker.sock`) to run job containers.
