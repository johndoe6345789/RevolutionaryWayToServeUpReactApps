import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodegenEntrypoint } from './codegen-entrypoint';
import { ExecutionManager } from '../core/codegen/execution-manager';
import { PluginManager } from '../core/plugins/plugin-manager';
import type { CompositeLifecycle } from '../core/types/composite-lifecycle';
import type { LifecycleBuilder } from '../core/types/lifecycle-builder';
import { LifecycleStatus } from '../core/types/lifecycle-status';
import type { IStandardLifecycle } from '../core/types/standard-lifecycle';

const createComponentSpec = (id: string) => ({
  uuid: '12345678-1234-4123-8123-123456789012',
  id,
  type: id,
  search: { title: id, summary: id, keywords: [id], domain: 'test', capabilities: [] },
});

const createCompositeLifecycle = (
  pluginManager: PluginManager,
  executionManager: ExecutionManager,
): CompositeLifecycle => {
  const children = new Map<string, IStandardLifecycle>([
    ['pluginManager', pluginManager],
    ['executionManager', executionManager],
  ]);

  return {
    getChildren: () => children,
    getStatus: vi.fn().mockReturnValue(LifecycleStatus.READY),
    initialise: vi.fn(),
    validate: vi.fn(),
    execute: vi.fn(),
    cleanup: vi.fn(),
    debug: vi.fn().mockReturnValue({}),
    reset: vi.fn(),
    status: vi.fn().mockReturnValue(LifecycleStatus.READY),
  } as CompositeLifecycle;
};

const createLifecycleBuilder = (composite: CompositeLifecycle): LifecycleBuilder => ({
  add: vi.fn().mockReturnThis(),
  dependsOn: vi.fn().mockReturnThis(),
  onError: vi.fn().mockReturnThis(),
  build: vi.fn().mockReturnValue(composite),
});

describe('CodegenEntrypoint', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let entrypoint: CodegenEntrypoint, pluginManager: PluginManager, executionManager: ExecutionManager;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    pluginManager = new PluginManager(createComponentSpec('plugin-manager'));
    pluginManager.getPlugins().set('alpha', {} as IStandardLifecycle);

    executionManager = new ExecutionManager(createComponentSpec('execution-manager'));
    vi.spyOn(executionManager, 'executeWithContext').mockResolvedValue({});

    const composite = createCompositeLifecycle(pluginManager, executionManager);
    const lifecycleBuilder = createLifecycleBuilder(composite);
    entrypoint = new CodegenEntrypoint(lifecycleBuilder);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('dispatches the generate command with parsed options', async () => {
    await entrypoint.runCLI(['generate', '--spec', 'petstore.yaml', '--output', 'dist']);

    expect(executionManager.executeWithContext).toHaveBeenCalledWith({
      language: undefined,
      operation: 'generate',
      outputDir: 'dist',
      profile: undefined,
      specPath: 'petstore.yaml',
      template: undefined,
    });
  });

  it('logs plugin and tool listings for the list command', async () => {
    await entrypoint.runCLI(['list']);

    expect(consoleSpy).toHaveBeenCalledWith('Plugins:', ['alpha']);
    expect(consoleSpy).toHaveBeenCalledWith('Tools:', ['alpha']);
  });

  it('describes a plugin before attempting execution components', async () => {
    await entrypoint.runCLI(['describe', 'alpha']);

    expect(consoleSpy).toHaveBeenCalledWith('Component: alpha (Plugin)');
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('(Execution)'));
  });

  it('falls back to execution component description', async () => {
    await entrypoint.runCLI(['describe', 'execution-manager']);

    expect(consoleSpy).toHaveBeenCalledWith('Component: execution-manager (Execution)');
  });
});
