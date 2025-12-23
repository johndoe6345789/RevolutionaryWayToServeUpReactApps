#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(command) {
  try {
    execSync(command, { cwd: path.dirname(__dirname), stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

console.log('Running ESLint...');
run('bunx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0');

console.log('Running Prettier check...');
run('bunx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"');

console.log('Running TypeScript compiler...');
run('bunx tsc --noEmit');

console.log('✓ All lint checks passed');
