export = NetworkProbeServiceConfig;

declare class NetworkProbeServiceConfig {
  constructor(options?: {
    globalObject?: Record<string, unknown>;
    logClient?: (...args: any[]) => void;
    wait?: (ms: number) => Promise<void>;
  });
  globalObject: Record<string, unknown>;
  logClient: (...args: any[]) => void;
  wait: (ms: number) => Promise<void>;
}
