export = NetworkProviderServiceConfig;

declare class NetworkProviderServiceConfig {
  constructor(options?: {
    globalObject?: Record<string, unknown>;
    isCommonJs?: boolean;
    fallbackProviders?: string[];
    defaultFallbackProviders?: string[];
    defaultProviderBase?: string;
    defaultProviderAliases?: Record<string, string>;
    proxyModeAuto?: string;
    proxyModeProxy?: string;
    proxyModeDirect?: string;
  });
  globalObject: Record<string, unknown>;
  defaultFallbackProviders: string[];
  fallbackProviders: string[];
  defaultProviderBase: string;
  defaultProviderAliases: Record<string, string>;
  proxyModeAuto: string;
  proxyModeProxy: string;
  proxyModeDirect: string;
}
