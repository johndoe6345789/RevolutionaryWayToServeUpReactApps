export = ToolsLoaderConfig;

declare class ToolsLoaderConfig {
  constructor(options?: {
    dependencies?: Record<string, any>;
    serviceRegistry?: any;
    namespace?: Record<string, any>;
  });
  dependencies?: Record<string, any>;
  serviceRegistry?: any;
  namespace?: Record<string, any>;
}
