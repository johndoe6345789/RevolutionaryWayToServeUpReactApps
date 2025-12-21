import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest as baseJest
} from "@jest/globals";

declare const require: NodeRequire | undefined;

const mockRegistry = new Map<
  string,
  { original?: NodeModule; factory: () => unknown }
>();

const clearRequireCache = () => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key];
  }
};

const resolveModuleId = (moduleName: string) => {
  if (typeof require !== "function" || typeof require.resolve !== "function") {
    return moduleName;
  }
  try {
    return require.resolve(moduleName);
  } catch {
    return moduleName;
  }
};

const overrideModule = (moduleId: string, mockExports: unknown) => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  mockRegistry.set(moduleId, {
    original: require.cache[moduleId],
    factory: () => mockExports
  });

  const mockModule = {
    id: moduleId,
    filename: moduleId,
    loaded: true,
    exports: mockExports,
    children: [],
    paths: []
  } as unknown as NodeModule;
  require.cache[moduleId] = mockModule;
};

const restoreModule = (moduleId: string) => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  const registration = mockRegistry.get(moduleId);
  if (!registration) {
    return;
  }
  if (registration.original) {
    require.cache[moduleId] = registration.original;
  } else {
    delete require.cache[moduleId];
  }
  mockRegistry.delete(moduleId);
};

const ensureJestShims = () => {
  const jestAny = baseJest as typeof baseJest & {
    resetModules?: typeof baseJest.resetModules;
    doMock?: typeof baseJest.doMock;
    dontMock?: typeof baseJest.dontMock;
  };

  if (typeof jestAny.resetModules !== "function") {
    jestAny.resetModules = () => {
      mockRegistry.clear();
      clearRequireCache();
      return baseJest;
    };
  }

  if (typeof jestAny.doMock !== "function") {
    jestAny.doMock = (moduleName: string, factory?: () => unknown) => {
      const moduleId = resolveModuleId(moduleName);
      overrideModule(moduleId, factory ? factory() : undefined);
      return baseJest;
    };
  }

  if (typeof jestAny.dontMock !== "function") {
    jestAny.dontMock = (moduleName: string) => {
      const moduleId = resolveModuleId(moduleName);
      restoreModule(moduleId);
      return baseJest;
    };
  }
};

ensureJestShims();

export { afterEach, beforeEach, describe, expect, it, baseJest as jest };
