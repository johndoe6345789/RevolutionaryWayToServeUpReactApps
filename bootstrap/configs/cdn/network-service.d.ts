export = NetworkServiceConfig;

declare class NetworkServiceConfig {
  constructor(options?: {
    logClient?: (...args: any[]) => void;
    wait?: (ms: number) => Promise<void>;
    namespace?: Record<string, unknown>;
    providerConfig?: Record<string, unknown>;
    probeConfig?: Record<string, unknown>;
    moduleResolverConfig?: Record<string, unknown>;
    isCommonJs?: boolean;
  });
  logClient?: (...args: any[]) => void;
  wait?: (ms: number) => Promise<void>;
  namespace?: Record<string, unknown>;
  providerConfig?: Record<string, unknown>;
  probeConfig?: Record<string, unknown>;
  moduleResolverConfig?: Record<string, unknown>;
  isCommonJs?: boolean;
}
