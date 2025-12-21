#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(repoRoot, 'bootstrap');
const testsRoot = path.join(repoRoot, 'test-tooling', 'tests');

async function collectFiles(directory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function formatPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function createStubContent(relPath, importPath) {
  return `/**
 * Auto-generated test stub for bootstrap/${formatPosixPath(relPath)}
 */
const target = require('${formatPosixPath(importPath)}');

describe('bootstrap/${formatPosixPath(relPath)}', () => {
  test('loads without throwing', () => {
    expect(target).toBeDefined();
  });
});
`;
}

async function ensureMapping() {
  const sourceFiles = await collectFiles(sourceRoot);
  for (const sourceFile of sourceFiles) {
    const relPath = path.relative(sourceRoot, sourceFile);
    const targetPath = path.join(testsRoot, relPath);
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

    const ext = path.extname(sourceFile);
    if (ext === '.js') {
      const importPath = path.relative(path.dirname(targetPath), path.join(sourceRoot, relPath));
      const stub = createStubContent(relPath, importPath);
      await fs.promises.writeFile(targetPath, stub);
    } else {
      const data = await fs.promises.readFile(sourceFile);
      await fs.promises.writeFile(targetPath, data);
    }
  }
}

ensureMapping().catch((error) => {
  console.error(error);
  process.exit(1);
});
