export = ScriptListLoaderConfig;

declare class ScriptListLoaderConfig {
  constructor(options?: {
    document?: Document;
    manifestUrl?: string;
    fetch?: typeof fetch;
    log?: (...args: any[]) => void;
  });
  document?: Document;
  manifestUrl?: string;
  fetch?: typeof fetch;
  log?: (...args: any[]) => void;
}
