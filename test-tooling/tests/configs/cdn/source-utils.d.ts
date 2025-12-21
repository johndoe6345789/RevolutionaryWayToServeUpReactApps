export = SourceUtilsConfig;

declare class SourceUtilsConfig {
  constructor(options?: { serviceRegistry?: any; namespace?: Record<string, any> });
  serviceRegistry?: any;
  namespace?: Record<string, any>;
}
