export = NetworkServiceConfig;

declare class NetworkServiceConfig {
  constructor(options?: {
    logClient?: (...args: any[]) => void;
    wait?: (ms: number) => Promise<void>;
    namespace?: Record<string, unknown>;
  });
  logClient?: (...args: any[]) => void;
  wait?: (ms: number) => Promise<void>;
  namespace?: Record<string, unknown>;
}
