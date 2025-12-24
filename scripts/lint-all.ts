import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const steps = [
  {
    name: 'codegen lint',
    command: 'npm run lint',
    cwd: resolve(repoRoot, 'codegen'),
  },
  {
    name: 'retro-react-app lint',
    command: 'bunx eslint .',
    cwd: resolve(repoRoot, 'retro-react-app'),
  },
];

function runStep(step: { name: string; command: string; cwd: string }) {
  console.log(`\n▶️  Running ${step.name} (${step.command})`);
  execSync(step.command, { stdio: 'inherit', cwd: step.cwd });
}

try {
  steps.forEach(runStep);
  console.log('\nAll lint steps completed successfully.');
} catch (error) {
  console.error('\nLint workflow failed.', error instanceof Error ? error.message : error);
  process.exit(1);
}
