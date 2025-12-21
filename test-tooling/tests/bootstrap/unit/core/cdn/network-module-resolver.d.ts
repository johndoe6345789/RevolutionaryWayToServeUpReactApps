export = NetworkModuleResolverConfig;

declare class NetworkModuleResolverConfig {
  constructor(options?: {
    providerService?: Record<string, unknown>;
    probeService?: Record<string, unknown>;
    logClient?: (...args: any[]) => void;
  });
  providerService?: Record<string, unknown>;
  probeService?: Record<string, unknown>;
  logClient: (...args: any[]) => void;
}
