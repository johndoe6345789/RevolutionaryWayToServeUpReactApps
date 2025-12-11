export function loadConfig(): Promise<Record<string, any>>;
export function loadScript(url: string): Promise<void>;
export function normalizeProviderBase(provider?: string): string;
export function probeUrl(url: string, opts?: Record<string, any>): Promise<boolean>;
export function resolveModuleUrl(mod: Record<string, any>): Promise<string>;
export function loadTools(tools: Array<Record<string, any>>): Promise<void>;
export function makeNamespace<T = any>(globalObj: T): Record<string, any> & {
  default: T;
  __esModule: true;
};
export function loadModules(modules: Array<Record<string, any>>): Promise<Record<string, any>>;
export function loadDynamicModule(
  name: string,
  config: Record<string, any>,
  registry: Record<string, any>
): Promise<any>;

export type RequireFn = ((name: string) => any) & {
  _async(name: string, baseDir?: string): Promise<any>;
};

export function createRequire(
  registry: Record<string, any>,
  config: Record<string, any>,
  entryDirOrDynamicLoader?: string | ((name: string, config: Record<string, any>, registry: Record<string, any>) => any),
  localModuleLoader?: any,
  dynamicModuleLoader?: any
): RequireFn;

export function compileSCSS(scssFile: string): Promise<string>;
export function injectCSS(css: string): void;
export function collectDynamicModuleImports(
  source: string,
  config: Record<string, any>
): string[];
export function preloadDynamicModulesFromSource(
  source: string,
  requireFn: RequireFn,
  config: Record<string, any>
): Promise<void>;
export function collectModuleSpecifiers(source: string): string[];
export function preloadModulesFromSource(
  source: string,
  requireFn: RequireFn,
  baseDir?: string
): Promise<void>;
export function compileTSX(entryFile: string, requireFn: RequireFn, entryDir?: string): Promise<any>;
export function frameworkRender(
  config: Record<string, any>,
  registry: Record<string, any>,
  App: any
): void;
export function bootstrap(): Promise<void>;
