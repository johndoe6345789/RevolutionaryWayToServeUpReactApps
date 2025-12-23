#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run(command) {
  try {
    execSync(command, { stdio: 'inherit', cwd: path.dirname(__dirname) });
  } catch (error) {
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
