import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneratedCLI } from './generated-cli';
import type { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

const createTestEntrypoint = (): CodegenEntrypoint => {
  const pluginMap = new Map<string, unknown>([
    [
      'git',
      {
        id: 'git',
        uuid: '550e8400-e29b-41d4-a716-446655440120',
        type: 'tool',
        search: { title: 'Git', summary: 'Version control' },
        execute: vi.fn(async (cmd: string, args: string[]) => ({ cmd, args })),
      },
    ],
  ]);

  const pluginManager = {
    id: 'pluginManager',
    uuid: '550e8400-e29b-41d4-a716-446655440121',
    type: 'manager',
    search: {
      title: 'Plugin Manager',
      summary: 'Manages plugins for tests',
      domain: 'core',
      keywords: ['plugin'],
      capabilities: ['discovery'],
    },
    debug: () => ({
      spec: { search: { title: 'Plugin Manager', summary: 'Manages plugins for tests' } },
    }),
    status: () => 'ready',
    getPlugins: () => pluginMap,
  };

  const executionManager = {
    id: 'executionManager',
    uuid: '550e8400-e29b-41d4-a716-446655440122',
    type: 'manager',
    search: {
      title: 'Execution Manager',
      summary: 'Executes requests for tests',
      domain: 'core',
      keywords: ['execute'],
      capabilities: ['run'],
    },
    debug: () => ({
      spec: { search: { title: 'Execution Manager', summary: 'Executes requests for tests' } },
    }),
    status: () => 'ready',
    executeWithContext: vi.fn(async (context: Record<string, unknown>) => ({ ok: true, context })),
  };

  const lifecycleChildren = new Map<string, any>([
    ['pluginManager', pluginManager],
    ['executionManager', executionManager],
  ]);

  const lifecycle = {
    getChildren: () => lifecycleChildren,
    getStatus: () => 'ready',
    debug: () => lifecycleChildren,
  } as const;

  return {
    getCompositeLifecycle: () => lifecycle as any,
    getComponent: (name: string) => lifecycleChildren.get(name),
  } as unknown as CodegenEntrypoint;
};

const captureConsole = () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  return {
    logs: () => logSpy.mock.calls.map((call) => call.join(' ')).join('\n'),
    errors: () => errorSpy.mock.calls.map((call) => call.join(' ')).join('\n'),
    restore: () => {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    },
  };
};

describe('GeneratedCLI command outputs', () => {
  let entrypoint: CodegenEntrypoint;
  let cli: GeneratedCLI;

  beforeEach(() => {
    entrypoint = createTestEntrypoint();
    cli = new GeneratedCLI(entrypoint);
  });

  it('lists lifecycle components', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['list']);
    expect(consoleCapture.logs()).toEqual(
      'Available components:\n  pluginManager - Plugin Manager\n  executionManager - Execution Manager',
    );
    consoleCapture.restore();
  });

  it('describes a component with metadata', async () => {
    const consoleCapture = captureConsole();
    // @ts-expect-error accessing private method for test coverage
    await cli._handleDescribe(['pluginManager'], entrypoint);
    expect(consoleCapture.logs()).toContain('Component: pluginManager');
    expect(consoleCapture.logs()).toContain('Summary: Manages plugins for tests');
    consoleCapture.restore();
  });

  it('searches components by query', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['search', 'plugin']);
    expect(consoleCapture.logs()).toContain('Found 1 component(s):');
    expect(consoleCapture.logs()).toContain('pluginManager: Manages plugins for tests');
    consoleCapture.restore();
  });

  it('runs a tool command with arguments', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['tool', 'run', 'git', 'status']);
    expect(consoleCapture.logs()).toContain("Executed 'git' with command 'status'. Result:");
    consoleCapture.restore();
  });

  it('shows usage when tool subcommand is missing', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['tool']);
    expect(consoleCapture.errors()).toContain('Usage: codegen tool install <tool-id> [--profile=<profile>]');
    consoleCapture.restore();
  });

  it('generates a runbook with required flags', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['runbook', 'generate', '--profile=fullstack-dev', '--platform=linux']);
    expect(consoleCapture.logs()).toContain("Runbook generated for profile 'fullstack-dev' on platform 'linux'.");
    consoleCapture.restore();
  });

  it('lists and applies profiles', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['profile', 'list']);
    expect(consoleCapture.logs()).toContain('Available profiles:');
    consoleCapture.restore();

    const secondCapture = captureConsole();
    await cli.run(['profile', 'apply', 'data-science']);
    expect(secondCapture.logs()).toContain("Profile 'data-science' applied.");
    secondCapture.restore();
  });

  it('generates schema definitions with flags', async () => {
    const consoleCapture = captureConsole();
    await cli.run(['schema', 'generate', 'tool', '--bulk', '--defaults']);
    expect(consoleCapture.logs()).toContain("Schema generation requested for type 'tool'. Bulk=true, Defaults=true.");
    consoleCapture.restore();
  });

  it('validates schema files from disk', async () => {
    const consoleCapture = captureConsole();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-test-'));
    const schemaPath = path.join(tempDir, 'sample.json');
    fs.writeFileSync(schemaPath, JSON.stringify({ ok: true }));

    await cli.run(['schema', 'validate', schemaPath]);

    expect(consoleCapture.logs()).toContain('Schema at');
    consoleCapture.restore();
  });
});
