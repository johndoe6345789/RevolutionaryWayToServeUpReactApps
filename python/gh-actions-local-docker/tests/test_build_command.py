import unittest
from pathlib import Path

from src.run_actions_local import ActRunSpec, build_docker_command


class BuildCommandTests(unittest.TestCase):
    def test_builds_expected_core_flags(self) -> None:
        spec = ActRunSpec(
            repo_root=Path("/tmp/repo"),
            act_image="nektos/act:latest",
            workflow=None,
            event="push",
            job=None,
            platform=["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"],
            secrets_file=None,
            env_file=None,
            bind_workdir="/repo",
            reuse=False,
            privileged=False,
            verbose=False,
            dry_run=False,
        )
        cmd = build_docker_command(spec)
        self.assertEqual(cmd[0:3], ["docker", "run", "--rm"])
        self.assertIn("nektos/act:latest", cmd)
        self.assertEqual(cmd[-1], "push")

    def test_includes_optional_args(self) -> None:
        spec = ActRunSpec(
            repo_root=Path("/tmp/repo"),
            act_image="nektos/act:latest",
            workflow="/tmp/repo/.github/workflows/ci.yml",
            event="pull_request",
            job="build",
            platform=["ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"],
            secrets_file=Path("/tmp/secrets"),
            env_file=Path("/tmp/env"),
            bind_workdir="/repo",
            reuse=True,
            privileged=True,
            verbose=True,
            dry_run=False,
        )
        cmd = build_docker_command(spec)
        joined = " ".join(cmd)
        self.assertIn("--privileged", joined)
        self.assertIn("-W /tmp/repo/.github/workflows/ci.yml", joined)
        self.assertIn("-j build", joined)
        self.assertIn("--secret-file /tmp/secrets", joined)
        self.assertIn("--env-file /tmp/env", joined)
        self.assertIn("--reuse", joined)
        self.assertIn("-v", cmd)
        self.assertEqual(cmd[-1], "pull_request")


if __name__ == "__main__":
    unittest.main()
