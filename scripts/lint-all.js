#!/usr/bin/env node
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function resolveCommand(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

function runStep(title, command, args, cwd) {
  console.log(`\n→ ${title}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const repoRoot = path.resolve(__dirname, '..');

runStep(
  'Linting codegen via npm',
  resolveCommand('npm'),
  ['run', 'lint'],
  path.join(repoRoot, 'codegen'),
);

runStep(
  'Linting retro-react-app via bunx',
  resolveCommand('bunx'),
  ['eslint', '.'],
  path.join(repoRoot, 'retro-react-app'),
);
