export = BootstrapperConfig;

declare class BootstrapperConfig {
  constructor(options: {
    configUrl?: string;
    fetch?: typeof fetch;
    logging: Record<string, any>;
    network: Record<string, any>;
    moduleLoader: Record<string, any>;
  });
  configUrl: string;
  fetch?: typeof fetch;
  logging: Record<string, any>;
  network: Record<string, any>;
  moduleLoader: Record<string, any>;
}
